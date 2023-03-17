import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../schema/user.schema';
import { TwitterApi } from 'twitter-api-v2';
import { StringUtil } from '../../../util/string.util';
import { UserService } from './user.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../../../constant/error.constant';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import { gql, GraphQLClient } from 'graphql-request';

@Injectable()
export class VerifierService {
  private twitterClient;
  private readOnlyClient;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    @InjectGraphQLClient() private readonly client: GraphQLClient,
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const bearer = configService.get<string>('TWITTER_BEARER');

    this.twitterClient = new TwitterApi(bearer);
    this.readOnlyClient = this.twitterClient.readOnly;
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
    const usersPaginated = await this.readOnlyClient.v2.tweetLikedBy(
      targetTweetId,
      {
        asPaginator: true,
      },
    );

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
    const source = await this.readOnlyClient.v2.userByUsername(
      sourceTwitterUsername,
    );

    const followingPaginated = await this.readOnlyClient.v2.following(
      source.data.id,
      { asPaginator: true },
    );

    let paginatorIdx = 0;
    while (!followingPaginated.done) {
      this.logger.debug(`paginator index: ${paginatorIdx}`);
      for (const following of followingPaginated) {
        const followingUsername = following.username;
        if (StringUtil.trimAndEqual(followingUsername, targetTwitterUsername)) {
          return true;
        }
      }
      await followingPaginated.fetchNext();
      paginatorIdx++;
    }

    return false;
  }

  private async isRetweetedTwitterByUsername(
    sourceTwitterUsername: string,
    targetTweetId: string,
  ): Promise<boolean> {
    const usersPaginated = await this.readOnlyClient.v2.tweetRetweetedBy(
      targetTweetId,
      {
        asPaginator: true,
      },
    );

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
      throw ErrorCode.APTOS_INDEXER_ERROR;
    }
    return false;
  }
}
