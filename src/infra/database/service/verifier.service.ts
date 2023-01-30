import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../schema/user.schema';
import { TwitterApi } from 'twitter-api-v2';
import { StringUtil } from '../../../util/string.util';
import { UserService } from './user.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

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
}
