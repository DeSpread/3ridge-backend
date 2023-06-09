import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../constant/error.constant';
import { Quest } from '../infra/schema/quest.schema';
import { QuestPolicy } from '../infra/graphql/dto/policy.dto';
import { QuizQuestInput } from '../model/quiz.quest.model';
import { QuestPolicyType } from '../constant/quest.policy';
import { UserService } from './user.service';
import { User, UserWallet } from '../infra/schema/user.schema';
import { VerifierService } from './verifier.service';
import { ObjectUtil } from '../util/object.util';
import {
  Verify3ridgePoint,
  VerifyAptosExistTxQuest,
  VerifyTwitterFollowQuest,
  VerifyTwitterLikingQuest,
  VerifyTwitterRetweetQuest,
} from '../model/verify.quest.model';
import { StringUtil } from '../util/string.util';
import { IsCompletedQuestByUserIdResponse } from '../infra/graphql/dto/response.dto';
import { TicketService } from './ticket.service';
import { ChainType } from '../constant/chain.type';
import { LoggerService } from './loggerService';

@Injectable()
export class QuestService {
  constructor(
    private readonly logger: LoggerService,
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
      .populate('questGuides')
      .exec();
  }

  async isCompletedQuestByUserId(
    questId: string,
    userId: string,
  ): Promise<IsCompletedQuestByUserIdResponse> {
    let isCompleted = false;
    const quest = await this.questModel
      .findById(questId)
      .populate('questPolicy')
      .populate('completedUsers')
      .populate('questGuides')
      .exec();

    if (ObjectUtil.isNull(quest)) {
      throw ErrorCode.NOT_FOUND_QUEST;
    }

    const user: User = await quest.completedUsers.find((x: User) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (!ObjectUtil.isNull(user)) {
      isCompleted = true;
    }

    return {
      questId: questId,
      isCompleted: isCompleted,
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
        case QuestPolicyType.VERIFY_APTOS_BRIDGE_TO_APTOS:
          const verifyAptosQuest1: VerifyAptosExistTxQuest = JSON.parse(
            questPolicy.context,
          );
          return false;
        case QuestPolicyType.VERIFY_3RIDGE_POINT:
          const verify3ridgePoint: Verify3ridgePoint = JSON.parse(
            questPolicy.context,
          );
          return false;
        default:
          return false;
        // TODO: 나머지 Type도 추가 필요
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
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }

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
      if (StringUtil.isEqualsIgnoreCase(user._id, userId)) {
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

  async verifyAptosQuest(ticketId: string, questId: string, userId: string) {
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }
    const user: User = await this.userService.findUserById(userId);
    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const quest: Quest = await this.questModel.findById(questId);

    console.log(quest.questPolicy.context);
    if (await this.isInvalidQuest(quest.questPolicy)) {
      throw ErrorCode.BAD_REQUEST_QUIZ_QUEST_COLLECTION;
    }

    const userAptosWallets: UserWallet[] = user.wallets.filter(
      (wallet: UserWallet) => {
        if (wallet.chain === ChainType.APTOS) {
          return true;
        }
        return false;
      },
    );

    if (userAptosWallets.length < 1) throw ErrorCode.DOES_NOT_HAVA_APTOS_WALLET;

    const userAptosWalletAddress = userAptosWallets[0].address;
    this.logger.debug(
      `found userAptosWalletAddress: ${userAptosWalletAddress}`,
    );

    switch (quest.questPolicy.questPolicy) {
      case QuestPolicyType.VERIFY_APTOS_BRIDGE_TO_APTOS:
        const isBridgeToAptos = await this.verifierService.isBridgeToAptos(
          userAptosWalletAddress,
        );
        if (!isBridgeToAptos) throw ErrorCode.DOES_NOT_BRIDGE_TO_APTOS;
        break;
      case QuestPolicyType.VERIFY_APTOS_HAS_NFT:
        const hasNft = await this.verifierService.hasAptosNft(
          userAptosWalletAddress,
        );
        if (!hasNft) throw ErrorCode.DOES_NOT_HAVE_APTOS_NFT;
        break;
      case QuestPolicyType.VERIFY_APTOS_EXIST_TX:
        const verifyAptosExistTxQuest: VerifyAptosExistTxQuest = JSON.parse(
          quest.questPolicy.context,
        );
        const hasAptosTransaction =
          await this.verifierService.hasAptosTransactions(
            userAptosWalletAddress,
            verifyAptosExistTxQuest.txCount,
          );
        if (!hasAptosTransaction)
          throw ErrorCode.DOES_NOT_HAVE_ATPOS_TRANSACTION;
        break;
      case QuestPolicyType.VERIFY_APTOS_HAS_ANS:
        const hasAptosAns = await this.verifierService.hasAtosAns(
          userAptosWalletAddress,
        );
        if (!hasAptosAns) throw ErrorCode.DOES_NOT_HAVE_ATPOS_ANS;
        break;
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
      `Successful to verify aptos quest. ticketId: ${ticketId}, questId: ${questId}, userId: ${userId}`,
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }

  async verify3ridgePointQuest(
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

    const verify3ridgePoint: Verify3ridgePoint = JSON.parse(
      quest.questPolicy.context,
    );
    const point = verify3ridgePoint.point;
    const user: User = await this.verifierService.hasEnough3ridgePoint(
      userId,
      point,
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
      `Successful to verify has enough 3ridge point. questId: ${questId}, userId: ${userId}, 3ridge point: ${user.rewardPoint}`,
    );

    await this.ticketService.participateTicketOfUser(ticketId, userId);

    return quest;
  }
}