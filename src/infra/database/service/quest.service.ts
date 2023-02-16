import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../constant/error.constant';
import { Quest } from '../../schema/quest.schema';
import { QuestPolicy } from '../../graphql/dto/policy.dto';
import { QuizQuestInput } from '../../../model/quiz.quest.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { QuestPolicyType } from '../../../constant/quest.policy';
import { UserService } from './user.service';
import { User } from '../../schema/user.schema';
import { VerifierService } from './verifier.service';
import { ObjectUtil } from '../../../util/object.util';
import {
  VerifyTwitterFollowQuest,
  VerifyTwitterLikingQuest,
  VerifyTwitterRetweetQuest,
} from '../../../model/verify.quest.model';
import { StringUtil } from '../../../util/string.util';
import { IsCompletedQuestByUserIdResponse } from '../../graphql/dto/response.dto';
import { TicketService } from './ticket.service';

@Injectable()
export class QuestService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    @InjectModel(Quest.name)
    private readonly questModel: Model<Quest>,
    private userService: UserService,
    private verifierService: VerifierService,
    @Inject(forwardRef(() => TicketService))
    private ticketService: TicketService,
  ) {}

  async findQuestById(questId: string): Promise<Quest> {
    return await this.questModel
      .findById(questId)
      .populate('questPolicy')
      .populate('completedUsers')
      .exec();
  }

  async isCompletedQuestByUserId(
    questId: string,
    userId: string,
  ): Promise<IsCompletedQuestByUserIdResponse> {
    const quest = await this.questModel
      .findById(questId)
      .populate('questPolicy')
      .populate('completedUsers')
      .exec();

    if (ObjectUtil.isNull(quest)) {
      throw ErrorCode.NOT_FOUND_QUEST;
    }

    const user: User = await quest.completedUsers.find((x: User) =>
      StringUtil.trimAndEqual(String(x._id), userId),
    );

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    return {
      questId: questId,
      isCompleted: true,
    } as IsCompletedQuestByUserIdResponse;
  }

  async isInvalidQuest(questPolicy: QuestPolicy): Promise<boolean> {
    try {
      switch (questPolicy.questPolicy) {
        case QuestPolicyType.QUIZ:
          const quizQuestInput: QuizQuestInput = JSON.parse(
            questPolicy.context,
          );
          return false;
        case QuestPolicyType.VERIFY_TWITTER_FOLLOW:
          const verifyTwitterFollowQuest1: VerifyTwitterFollowQuest =
            JSON.parse(questPolicy.context);
          return false;
        case QuestPolicyType.VERIFY_TWITTER_RETWEET:
          const verifyTwitterRetweetQuest1: VerifyTwitterRetweetQuest =
            JSON.parse(questPolicy.context);
          return false;
        case QuestPolicyType.VERIFY_TWITTER_LIKING:
          const verifyTwitterLikingQuest1: VerifyTwitterLikingQuest =
            JSON.parse(questPolicy.context);
          return false;
      }
    } catch (e) {
      this.logger.error(`Requested quest is invalid. error: [${e.message}]`);
      return true;
    }
  }

  async getQuestList(quests: Quest[]): Promise<Quest[]> {
    const questList: Quest[] = [];
    for (const quest of quests) {
      if (await this.isInvalidQuest(quest.questPolicy)) {
        throw ErrorCode.BAD_REQUEST_QUIZ_QUEST_COLLECTION;
      }
      const questModel = new this.questModel(quest);
      questList.push(await questModel.save());
    }
    return questList;
  }

  async completeQuestOfUser(ticketId: string, questId: string, userId: string) {
    const user: User = await this.userService.findUserById(userId);
    const quest: Quest = await this.questModel.findByIdAndUpdate(
      { _id: questId },
      {
        $push: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }

  async getCompletedUsers(questId: string): Promise<User[]> {
    const quest: Quest = await this.questModel.findById(questId);
    return quest.completedUsers;
  }

  async isAlreadyCompletedUser(
    questId: string,
    userId: string,
  ): Promise<boolean> {
    const completedUsers = await this.getCompletedUsers(questId);
    for (const user of completedUsers) {
      if (StringUtil.trimAndEqual(String(user._id), userId)) {
        return true;
      }
    }
    return false;
  }

  async verifyTwitterFollowQuest(
    ticketId: string,
    questId: string,
    userId: string,
  ) {
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }

    const quest: Quest = await this.questModel.findById(questId);

    if (await this.isInvalidQuest(quest.questPolicy)) {
      throw ErrorCode.BAD_REQUEST_QUIZ_QUEST_COLLECTION;
    }

    const verifyTwitterQuest: VerifyTwitterFollowQuest = JSON.parse(
      quest.questPolicy.context,
    );
    const targetTwitterUsername: string = verifyTwitterQuest.username;

    const user: User = await this.verifierService.isFollowTwitterByUserId(
      userId,
      targetTwitterUsername,
    );

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    await this.questModel.findByIdAndUpdate(
      { _id: questId },
      {
        $push: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter follow. questId: ${questId}, userId: ${userId}, targetTwitterUsername: ${targetTwitterUsername}`,
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }

  async verifyTwitterRetweetQuest(
    ticketId: string,
    questId: string,
    userId: string,
  ) {
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }

    const quest: Quest = await this.questModel.findById(questId);

    if (await this.isInvalidQuest(quest.questPolicy)) {
      throw ErrorCode.BAD_REQUEST_QUIZ_QUEST_COLLECTION;
    }

    const verifyTwitterRetweetQuest1: VerifyTwitterRetweetQuest = JSON.parse(
      quest.questPolicy.context,
    );
    const targetRetweetId = verifyTwitterRetweetQuest1.tweetId;
    const user: User = await this.verifierService.isRetweetedTwitterByUserId(
      userId,
      targetRetweetId,
    );

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    await this.questModel.findByIdAndUpdate(
      { _id: questId },
      {
        $push: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter retweet. questId: ${questId}, userId: ${userId}, targetRetweetId: ${targetRetweetId}`,
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }

  async verifyTwitterLikingQuest(
    ticketId: string,
    questId: string,
    userId: string,
  ) {
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }

    const quest: Quest = await this.questModel.findById(questId);

    if (await this.isInvalidQuest(quest.questPolicy)) {
      throw ErrorCode.BAD_REQUEST_QUIZ_QUEST_COLLECTION;
    }

    const verifyTwitterLikingQuest1: VerifyTwitterLikingQuest = JSON.parse(
      quest.questPolicy.context,
    );
    const targetTweetId = verifyTwitterLikingQuest1.tweetId;
    const user: User = await this.verifierService.isLikingTweetByUserId(
      userId,
      targetTweetId,
    );

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    await this.questModel.findByIdAndUpdate(
      { _id: questId },
      {
        $push: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter liking. questId: ${questId}, userId: ${userId}, targetTweetId: ${targetTweetId}`,
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }
}
