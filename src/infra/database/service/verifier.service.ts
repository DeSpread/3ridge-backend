import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../schema/user.schema';
import { TwitterApi } from 'twitter-api-v2';
import { StringUtil } from '../../../util/string.util';
import { UserService } from './user.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../../../constant/error.constant';

@Injectable()
export class VerifierService {
  private twitterClient;
  private readOnlyClient;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const bearer = configService.get<string>('twitter.bearer');

    this.twitterClient = new TwitterApi(bearer);
    this.readOnlyClient = this.twitterClient.readOnly;
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

  private async isFollowTwitterByUsername(
    sourceTwitterUsername: string,
    targetTwitterUsername: string,
  ): Promise<boolean> {
    const source = await this.readOnlyClient.v2.userByUsername(
      sourceTwitterUsername,
    );

    const followingList = await this.readOnlyClient.v2.following(
      source.data.id,
    );

    for (const following of followingList.data) {
      const followingUsername = following['username'];
      if (StringUtil.trimAndEqual(followingUsername, targetTwitterUsername)) {
        return true;
      }
    }

    return false;
  }

  private async isRetweetedTwitterByUsername(
    sourceTwitterUsername: string,
    targetTweetId: string,
  ): Promise<boolean> {
    const source = await this.readOnlyClient.v2.userByUsername(
      sourceTwitterUsername,
    );

    const userTimeline = await this.readOnlyClient.v2.userTimeline(
      source.data.id,
    );

    while (!userTimeline.done) {
      for (const fetchedTweet of userTimeline) {
        console.log(fetchedTweet);

        const tweetId = fetchedTweet['id'];
        const tweetText = fetchedTweet['text'];

        if (
          tweetText.toUpperCase().startsWith('RT') &&
          StringUtil.trimAndEqual(tweetId, targetTweetId)
        ) {
          return true;
        }
      }
      await userTimeline.fetchNext();
    }

    return false;
  }
}
