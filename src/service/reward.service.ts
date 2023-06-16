import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RewardPolicy } from '../infra/graphql/dto/policy.dto';
import { AptosNFT, RewardContext } from '../model/reward.model';
import { RewardPolicyType, RewardUnitType } from '../constant/reward.type';
import { TicketService } from './ticket.service';
import { AptosService } from './aptos.service';
import { Ticket } from '../infra/schema/ticket.schema';
import { User, UserWallet } from '../infra/schema/user.schema';
import { ChainType } from '../constant/chain.type';
import { UserService } from './user.service';
import { StringUtil } from '../util/string.util';
import { ErrorCode } from '../constant/error.constant';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class RewardService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    @Inject(forwardRef(() => TicketService))
    private readonly ticketService: TicketService,
    private readonly aptosService: AptosService,
    private readonly userService: UserService,
  ) {}

  async isInvalidReward(rewardPolicy: RewardPolicy): Promise<boolean> {
    try {
      switch (rewardPolicy.rewardPolicyType) {
        case RewardPolicyType.FCFS:
          const input: RewardContext = JSON.parse(rewardPolicy.context);
          return false;
      }
    } catch (e) {
      this.logger.error(`Requested reward is invalid. error: [${e.message}]`);
      return true;
    }
  }

  async checkRewardClaimableUser(ticketId: string, userId: string) {
    const ticket: Ticket = await this.ticketService.findById(ticketId);
    const user: User = await this.userService.findById(userId);

    const isRewardClaimed: boolean = ticket.rewardClaimedUsers.some((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    // Check if reward already claimed
    if (isRewardClaimed) {
      this.logger.error(
        `user already claimed reward. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      throw ErrorCode.ALREADY_CLAIMED_REWARD;
    }

    // Check if user is winner
    const isWinner: boolean = ticket.winners.some((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (!isWinner) {
      this.logger.error(
        `user is not winner of this ticket. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      throw ErrorCode.DOES_NOT_WIN_TICKET;
    }

    // Check if the user has a wallet on the required network to receive the reward
    const userWallet: UserWallet[] = user.wallets.filter(
      (wallet: UserWallet) => wallet.chain === ChainType.APTOS,
    );

    this.logger.debug(
      `user has wallet included in reward chain type. userWallet: [${JSON.stringify(
        userWallet,
      )}]`,
    );
    if (userWallet.length === 0) {
      throw ErrorCode.DOES_NOT_CONNECTED_WALLET;
    }
  }

  async claimReward(ticketId: string, userId: string): Promise<boolean> {
    this.logger.debug(
      `[${this.claimReward.name}] request to claim reward. ticketId: ${ticketId}, userId: ${userId}`,
    );

    await this.checkRewardClaimableUser(ticketId, userId);

    const ticket: Ticket = await this.ticketService.findById(ticketId);
    const user: User = await this.userService.findById(userId);
    const rewardContext: RewardContext = JSON.parse(
      ticket.rewardPolicy.context,
    );
    const userWallet: UserWallet = user.wallets.find(
      (wallet: UserWallet) => wallet.chain === rewardContext.rewardChain,
    );

    try {
      switch (rewardContext.rewardChain) {
        case ChainType.APTOS:
          if (rewardContext.rewardUnit === RewardUnitType.NFT) {
            const aptosNFT: AptosNFT = rewardContext.rewardDesp;
            await this.aptosService.claimAptosNFT(userWallet, aptosNFT); // TODO: 실패 되는 케이스를 위해서 통계 집계가 필요함
          }
          break;
        default:
          throw ErrorCode.DOES_NOT_HAVE_REWARD_CONTEXT;
      }
    } catch (e) {
      throw e;
    }

    await this.ticketService.checkAndUpdateRewardClaimedUser(ticketId, userId);
    return true;
  }
}
