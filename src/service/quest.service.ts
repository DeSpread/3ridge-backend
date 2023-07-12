import { Injectable } from '@nestjs/common';
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
import { ChainType } from '../constant/chain.type';
import { LoggerService } from './logger.service';
import { Ticket } from '../infra/schema/ticket.schema';
import { RewardContext } from '../model/reward.model';
import { RewardPolicyType } from '../constant/reward.type';
import { PointUpdateType } from '../constant/point.type';

@Injectable()
export class QuestService {
  constructor(
    @InjectModel(Quest.name)
    private readonly questModel: Model<Quest>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,

    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly verifierService: VerifierService,
  ) {}

  async participateTicketOfUser(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel
      .findById(ticketId)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    // 1. Check if the ticket exceed limit of participants
    const fcfsRewardInput: RewardContext = JSON.parse(
      ticket.rewardPolicy.context,
    );
    const isExceedLimitOfParticipants =
      ticket.participantCount >= fcfsRewardInput.limitNumber;

    if (
      ticket?.rewardPolicy?.rewardPolicyType === RewardPolicyType.FCFS &&
      isExceedLimitOfParticipants
    ) {
      throw ErrorCode.EXCEED_LIMIT_PARTICIPANTS_TICKET;
    }

    // 2. Check if user participate ticket and update
    const isAlreadyParticiaptedUser: User = await ticket.participants.find(
      (x) => StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (ObjectUtil.isNull(isAlreadyParticiaptedUser)) {
      // Check if this user completed all quests & if then, update winner list
      await this.ticketModel.findByIdAndUpdate(
        { _id: ticketId },
        {
          $addToSet: {
            participants: user,
          },
          $inc: {
            participantCount: 1,
          },
        },
        { new: true },
      );

      this.logger.debug(
        `This quest is first in user's participating ticket. Successful to participate ticket. ticketId: ${ticketId}, userId: ${userId}`,
      );
    } else {
      this.logger.debug(
        `Already user's participating ticket include this ticket. ticketId: ${ticketId}, userId: ${userId}`,
      );
    }

    // 3. Check if user's participatingTicket list has this ticket and update list
    await this.userService.checkParticipatedTicketAndUpdate(user, ticket);

    // 4. Check if user complete all quest in the ticket and update to complete ticket
    await this.checkAndUpdateCompleteTicket(ticketId, userId);

    this.logger.debug(
      `Successful update to check and participate ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );
    return ticket;
  }

  async checkAndUpdateCompleteTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    const isCompletedTicket = await this.isCompletedTicket(ticketId, userId);

    if (!isCompletedTicket) {
      this.logger.error(
        `user does not complete all quests in ticket. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      return null;
    }

    const ticket = await this.addCompletedUserToTicket(ticketId, userId);
    if (ticket?.pointUpdateType === PointUpdateType.PER_TICKET)
      await this.userService.rewardPointToUser(
        userId,
        ticket.rewardPolicy.rewardPoint,
      );

    if (ticket.rewardPolicy.rewardPolicyType === RewardPolicyType.FCFS) {
      this.logger.debug(
        'since the ticket reward selection method is FCFS, so should consider adding a winner list',
      );
      await this.addWinnerToTicket(ticketId, userId);
    } else {
      this.logger.debug(
        'Since the reward selection method is FCFS, does not consider adding a winner list',
      );
    }

    return ticket;
  }

  private async addCompletedUserToTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel
      .findById(ticketId)
      .populate('completedUsers')
      .exec();

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    const isAlreadyCompletedUser: User = await ticket.completedUsers.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    this.logger.debug(`isAlreadyCompletedUser: ${isAlreadyCompletedUser}`);

    if (!ObjectUtil.isNull(isAlreadyCompletedUser)) {
      throw ErrorCode.ALREADY_INCLUDED_COMPLETED_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to add completed user to ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }

  private async addWinnerToTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel
      .findById(ticketId)
      .populate('winners')
      .exec();

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    const isAlreadyWinnersUser: User = await ticket.winners.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (!ObjectUtil.isNull(isAlreadyWinnersUser)) {
      throw ErrorCode.ALREADY_INCLUDED_WINNER_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $addToSet: {
          winners: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to add winner to ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }

  async isCompletedTicket(ticketId: string, userId: string): Promise<boolean> {
    const ticket = await this.ticketModel
      .findById(ticketId)
      .populate('quests')
      .exec();

    for (const quest of ticket.quests) {
      const completedUsers: User[] = quest.completedUsers.filter((x) => {
        if (StringUtil.isEqualsIgnoreCase(x._id, userId)) {
          return true;
        }
      });
      if (completedUsers.length <= 0) {
        this.logger.error(
          `user doest not complete qeust. questId: [${quest._id}], userId: [${userId}]`,
        );
        return false;
      }

      this.logger.debug(
        `user completed qeust. questId: [${quest._id}], userId: [${userId}]`,
      );
    }
    return true;
  }

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

  async completeQuestOfUser(ticketId: string, questId: string, userId: string) {
    if (await this.isAlreadyCompletedUser(questId, userId)) {
      throw ErrorCode.ALREADY_VERIFIED_USER;
    }

    const user: User = await this.userService.findUserById(userId);
    const quest: Quest = await this.questModel.findByIdAndUpdate(
      { _id: questId },
      {
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    await this.participateTicketOfUser(ticketId, userId);

    return quest;
  }

  async getCompletedUsers(questId: string): Promise<User[]> {
    const quest: Quest = await this.findQuestById(questId);
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

    const quest: Quest = await this.findQuestById(questId);

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
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter follow. questId: ${questId}, userId: ${userId}, targetTwitterUsername: ${targetTwitterUsername}`,
    );

    await this.participateTicketOfUser(ticketId, userId);

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

    const quest: Quest = await this.findQuestById(questId);

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
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter retweet. questId: ${questId}, userId: ${userId}, targetRetweetId: ${targetRetweetId}`,
    );

    await this.participateTicketOfUser(ticketId, userId);

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

    const quest: Quest = await this.findQuestById(questId);

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
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify twitter liking. questId: ${questId}, userId: ${userId}, targetTweetId: ${targetTweetId}`,
    );

    await this.participateTicketOfUser(ticketId, userId);

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

    const quest: Quest = await this.findQuestById(questId);

    this.logger.debug(`[verifyAptosQuest] > ${quest.questPolicy.context}`);
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
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify aptos quest. ticketId: ${ticketId}, questId: ${questId}, userId: ${userId}`,
    );

    await this.participateTicketOfUser(ticketId, userId);

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

    const quest: Quest = await this.findQuestById(questId);

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
        $addToSet: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to verify has enough 3ridge point. questId: ${questId}, userId: ${userId}, 3ridge point: ${user.rewardPoint}`,
    );

    await this.participateTicketOfUser(ticketId, userId);

    return quest;
  }
}
