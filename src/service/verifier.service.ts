import { Injectable } from '@nestjs/common';
import { User } from '../infra/schema/user.schema';
import { TwitterApi } from 'twitter-api-v2';
import { StringUtil } from '../util/string.util';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../constant/error.constant';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { gql, GraphQLClient } from 'graphql-request';
import { RoundRobinItem, SequentialRoundRobin } from 'round-robin-js';
import { retryAsyncUntilDefined } from 'ts-retry/lib/cjs/retry';
import { LoggerService } from './logger.service';

@Injectable()
export class VerifierService {
  private static SEPARATOR = ',';
  private static TWITTER_CLIENT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };

  private _twitterClientPool: SequentialRoundRobin<TwitterApi> =
    new SequentialRoundRobin();
  private _twitterClient?: RoundRobinItem<TwitterApi>;

  constructor(
    @InjectGraphQLClient() private readonly client: GraphQLClient,

    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    configService
      .get<string>('TWITTER_BEARER')
      .split(VerifierService.SEPARATOR)
      .map((twitterBearerKey) => {
        this._twitterClientPool.add(new TwitterApi(twitterBearerKey));
        this.logger.debug(
          `add twitterBearerKey to Twitter client pool: [${twitterBearerKey}]`,
        );
      });
    this._twitterClient = this._twitterClientPool.next();
    this.logger.debug(`[Init] > Twitter Client ${JSON.stringify(client)}`);
  }

  get twitterReadOnlyClient() {
    const readOnlyClient = this._twitterClient.value.readOnly;
    this.logger.debug(
      `We use Twitter client: [${JSON.stringify(readOnlyClient)}]`,
    );
    return readOnlyClient;
  }

  async hasEnough3ridgePoint(
    userId: string,
    validationPoint: number,
  ): Promise<User> {
    const user: User = await this.userService.findUserById(userId);
    const rewardPoint: number = user.rewardPoint;

    if (rewardPoint < validationPoint) {
      throw ErrorCode.NOT_ENOUGH_3RIDGE_POINT;
    }

    this.logger.debug(
      `userId: ${userId} -> has point: ${rewardPoint}, validation point: ${validationPoint}`,
    );

    return user;
  }

  async isLikingTweetByUserId(
    userId: string,
    targetTweetId: string,
  ): Promise<User> {
    const user: User = await this.userService.findUserById(userId);
    const sourceTwitterUsername = user.userSocial.twitterId;
    const isLikingTweet = await this.isLikingTweetByUsername(
      sourceTwitterUsername,
      targetTweetId,
    );

    this.logger.debug(
      `userId: ${userId} -> targetTweetId: ${targetTweetId}, isLiking: ${isLikingTweet}`,
    );

    if (!isLikingTweet) {
      throw ErrorCode.DOES_NOT_TWITTER_LIKING;
    }

    return user;
  }

  async isFollowTwitterByUserId(
    userId: string,
    targetTwitterUsername: string,
  ): Promise<User> {
    const user: User = await this.userService.findUserById(userId);
    const sourceTwitterUsername = user.userSocial.twitterId;
    const isFollow = await this.isFollowTwitterByUsername(
      sourceTwitterUsername,
      targetTwitterUsername,
    );

    this.logger.debug(
      `userId: ${userId} -> targetTwitterUsername: ${targetTwitterUsername}, isFollow: ${isFollow}`,
    );

    if (!isFollow) {
      throw ErrorCode.DOES_NOT_TWITTER_FOLLOW;
    }

    return user;
  }

  async isRetweetedTwitterByUserId(
    userId: string,
    targetTweetId: string,
  ): Promise<User> {
    const user: User = await this.userService.findUserById(userId);
    const sourceTwitterUsername = user.userSocial.twitterId;
    const isRetweeted = await this.isRetweetedTwitterByUsername(
      sourceTwitterUsername,
      targetTweetId,
    );

    this.logger.debug(
      `userId: ${userId} -> targetTweetId: ${targetTweetId}, isRetweeted: ${isRetweeted}`,
    );

    if (!isRetweeted) {
      throw ErrorCode.DOES_NOT_TWITTER_RETWEET;
    }

    return user;
  }

  private async isLikingTweetByUsername(
    sourceTwitterUsername: string,
    targetTweetId: string,
  ): Promise<boolean> {
    const usersPaginated = await retryAsyncUntilDefined(async () => {
      try {
        return await this.twitterReadOnlyClient.v2.tweetLikedBy(targetTweetId, {
          asPaginator: true,
        });
      } catch (e) {
        this.logger.error(`Failed to fetch Twitter API. error: [${e.message}`);
        this._twitterClient = this._twitterClientPool.next();
      }
    }, VerifierService.TWITTER_CLIENT_RETRY_OPTIONS);

    let paginatorIdx = 0;
    while (!usersPaginated.done) {
      this.logger.debug(`paginator index: ${paginatorIdx}`);
      for (const user of usersPaginated) {
        if (StringUtil.trimAndEqual(user.username, sourceTwitterUsername)) {
          return true;
        }
      }
      await usersPaginated.fetchNext();
      paginatorIdx++;
    }

    return false;
  }

  private async isFollowTwitterByUsername(
    sourceTwitterUsername: string,
    targetTwitterUsername: string,
  ): Promise<boolean> {
    const followingPaginated = await retryAsyncUntilDefined(async () => {
      try {
        const source = await this.twitterReadOnlyClient.v2.userByUsername(
          sourceTwitterUsername,
        );

        this.logger.debug(
          `Successful to fetch userByUserName of Twitter API. data: [${JSON.stringify(
            source,
          )}]`,
        );

        return await this.twitterReadOnlyClient.v2.following(source.data.id, {
          asPaginator: true,
        });
      } catch (e) {
        this.logger.error(`Failed to fetch Twitter API. error: [${e.message}`);
        this._twitterClient = this._twitterClientPool.next();
      }
    }, VerifierService.TWITTER_CLIENT_RETRY_OPTIONS);

    let paginatorIdx = 0;
    do {
      this.logger.debug(`paginator index: ${paginatorIdx}`);
      for (const following of followingPaginated) {
        const followingUsername = following.username;
        if (
          StringUtil.isEqualsIgnoreCase(
            followingUsername,
            targetTwitterUsername,
          )
        ) {
          return true;
        }
      }
      await followingPaginated.fetchNext();
      paginatorIdx++;
    } while (!followingPaginated.done);

    return false;
  }

  private async isRetweetedTwitterByUsername(
    sourceTwitterUsername: string,
    targetTweetId: string,
  ): Promise<boolean> {
    const usersPaginated = await retryAsyncUntilDefined(async () => {
      try {
        return await this.twitterReadOnlyClient.v2.tweetRetweetedBy(
          targetTweetId,
          {
            asPaginator: true,
          },
        );
      } catch (e) {
        this.logger.error(`Failed to fetch Twitter API. error: [${e.message}`);
        this._twitterClient = this._twitterClientPool.next();
      }
    }, VerifierService.TWITTER_CLIENT_RETRY_OPTIONS);

    let paginatorIdx = 0;
    while (!usersPaginated.done) {
      this.logger.debug(`paginator index: ${paginatorIdx}`);
      for (const user of usersPaginated) {
        if (StringUtil.trimAndEqual(user.username, sourceTwitterUsername)) {
          return true;
        }
      }
      await usersPaginated.fetchNext();
      paginatorIdx++;
    }

    return false;
  }

  async hasAtosAns(walletAddress: string): Promise<boolean> {
    const query = gql`
      {
        current_ans_lookup(
          where: {
            registered_address: {
              _eq: "${walletAddress}"
            }
          }
        ) {
          registered_address
        }
      }
    `;
    try {
      const data = await this.client.request(query);
      const collection = data['current_ans_lookup'];
      if (!collection || collection.length === 0) return false;
      return true;
    } catch (e) {
      this.logger.error(`Failed to fetch hasAtosAns API. error: [${e.message}`);
      throw ErrorCode.APTOS_INDEXER_ERROR;
    }
    return false;
  }

  async hasAptosTransactions(
    walletAddress: string,
    transactionCount: number,
  ): Promise<boolean> {
    const query = gql`
      {
        user_transactions(
          where: {
            sender: {
              _eq: "${walletAddress}"
            }
          }
        ) {
          entry_function_id_str
          sequence_number
        }
      }
    `;
    try {
      const data = await this.client.request(query);
      const collection = data['user_transactions'];
      if (!collection || collection.length < transactionCount) return false;
      return true;
    } catch (e) {
      this.logger.error(
        `Failed to fetch hasAptosTransactions API. error: [${e.message}`,
      );
      throw ErrorCode.APTOS_INDEXER_ERROR;
    }
    return false;
  }

  async hasAptosNft(walletAddress: string): Promise<boolean> {
    const query = gql`
      {
        current_collection_ownership_view(
          where: {
            owner_address: {
              _eq: "${walletAddress}"
            }
          }
        ) {
          distinct_tokens
        }
      }
    `;
    try {
      const data = await this.client.request(query);
      const collection = data['current_collection_ownership_view'];
      if (!collection || collection.length === 0) return false;
      for (let i = 0; i < collection.length; i++) {
        const count = collection[i]['distinct_tokens'];
        if (count > 0) return true;
      }
    } catch (e) {
      this.logger.error(
        `Failed to fetch hasAptosNft API. error: [${e.message}`,
      );
      throw ErrorCode.APTOS_INDEXER_ERROR;
    }
    return false;
  }

  async isBridgeToAptos(walletAddress: string): Promise<boolean> {
    const query = gql`
        {
            coin_activities(
                where: {
                    owner_address: {
                        _eq: "${walletAddress}"
                    }
                }
            ) {
                entry_function_id_str
            }
        }
    `;
    try {
      const data = await this.client.request(query);
      const coinActivities = data['coin_activities'];

      if (!coinActivities || coinActivities.length === 0) return false;

      for (let i = 0; i < coinActivities.length; i++) {
        const functionStr: string = coinActivities[i]['entry_function_id_str'];
        if (functionStr.includes('coin_bridge')) {
          return true;
        }
      }
    } catch (e) {
      this.logger.error(
        `Failed to fetch isBridgeToAptos API. error: [${e.message}`,
      );
      throw ErrorCode.APTOS_INDEXER_ERROR;
    }
    return false;
  }
}
