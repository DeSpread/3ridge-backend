import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import {
  AptosAccount,
  AptosClient,
  CoinClient,
  FaucetClient,
  HexString,
  TokenClient,
} from 'aptos';
import { AptosRequestClaimNFTResponse } from '../../graphql/dto/response.dto';
import { ApolloError } from 'apollo-server-express';
import { TicketService } from './ticket.service';
import { Ticket } from '../../schema/ticket.schema';
import { AptosNFT, RewardContext } from '../../../model/reward.model';
import { UserService } from './user.service';
import { User, UserWallet } from '../../schema/user.schema';
import { ChainType } from '../../../constant/chain.type';

@Injectable()
export class AptosService {
  private nftCreator: AptosAccount;
  private client;
  private faucetClient;
  private tokenClient;
  private coinClient;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    private configService: ConfigService,
    private ticketService: TicketService,
    private userService: UserService,
  ) {
    this.nftCreator = new AptosAccount(
      HexString.ensure(
        this.configService.get<string>('APTOS_PRIVATE_KEY') as string,
      ).toUint8Array(),
    );
    this.client = new AptosClient(
      this.configService.get<string>('global.aptos.nodeUrl'),
    );

    this.faucetClient = new FaucetClient(
      this.configService.get<string>('global.aptos.nodeUrl'),
      this.configService.get<string>('global.aptos.faucetUrl'),
    );

    this.tokenClient = new TokenClient(this.client);
    this.coinClient = new CoinClient(this.client);
  }

  async claimAptosNFT(
    ticketId: string,
    userId: string,
  ): Promise<AptosRequestClaimNFTResponse> {
    await this.ticketService.checkRewardClaimableUser(ticketId, userId);

    const ticket: Ticket = await this.ticketService.findById(ticketId);
    const user: User = await this.userService.findById(userId);
    const userWallet: UserWallet = user.wallets.find(
      (wallet: UserWallet) => wallet.chain === ChainType.APTOS,
    );
    const rewardContext: RewardContext = JSON.parse(
      ticket.rewardPolicy.context,
    );
    const aptosNFT: AptosNFT = rewardContext.rewardDesp;

    console.log(this.nftCreator);
    console.log(userWallet);
    console.log(rewardContext);
    console.log(aptosNFT);

    // return {
    //   txHash: 'test',
    // };

    try {
      this.faucetClient.fundAccount(userWallet.address, 100_000_000);

      const txnHash = await this.tokenClient.directTransferToken(
        this.nftCreator,
        new AptosAccount(HexString.ensure(userWallet.address).toUint8Array()),
        this.nftCreator.address(),
        aptosNFT.collectionName,
        aptosNFT.tokenName,
        1,
        aptosNFT.tokenPropertyVersion,
      );
      await this.client.waitForTransaction(txnHash, { checkSuccess: true });
      await this.ticketService.checkAndUpdateRewardClaimedUser(
        ticketId,
        userId,
      );

      return {
        txHash: txnHash,
      } as AptosRequestClaimNFTResponse;
    } catch (e) {
      this.logger.error(`Failed to offer nft token. error: [${e.message}]`);
      throw new ApolloError(e.message, 'BAD_REQUEST_CLAIM_NFT');
    }
  }

  async checkTokenBalance(
    collectionName: string,
    tokenName: string,
    receiverAddress: string,
    tokenPropertyVersion: number,
  ): Promise<number> {
    const tokenId = {
      token_data_id: {
        creator: this.nftCreator.address().hex(),
        collection: collectionName,
        name: tokenName,
      },
      property_version: `${tokenPropertyVersion}`,
    };

    try {
      const balanceOfToken = await this.tokenClient.getTokenForAccount(
        receiverAddress,
        tokenId,
      );
      this.logger.debug(`Check token balance: [${balanceOfToken}]`);
      return balanceOfToken['amount'];
    } catch (e) {
      this.logger.error(`Check token balance. resource not found`);
    }
    return 0;
  }
}
