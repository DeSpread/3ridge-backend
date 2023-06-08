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
import { AptosRequestClaimNFTResponse } from '../infra/graphql/dto/response.dto';
import { ApolloError } from 'apollo-server-express';
import { ErrorCode } from '../constant/error.constant';
import { TicketService } from './ticket.service';

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

  async requestClaimNFT(
    ticketId: string,
    userId: string,
    collectionName: string,
    tokenName: string,
    receiverAddress: string,
    tokenAmount: number,
    tokenPropertyVersion: number,
  ): Promise<AptosRequestClaimNFTResponse> {
    const isClaimable = await this.isClaimable(ticketId, userId);

    if (!isClaimable) {
      throw ErrorCode.DOES_NOT_CLAIMABLE;
    }

    try {
      const txnHash = await this.tokenClient.offerToken(
        this.nftCreator,
        HexString.ensure(receiverAddress),
        this.nftCreator.address(),
        collectionName,
        tokenName,
        tokenAmount,
        tokenPropertyVersion,
      );
      await this.client.waitForTransaction(txnHash, { checkSuccess: true });
      this.faucetClient.fundAccount(receiverAddress, 100_000_000);

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

  private async isClaimable(
    ticketId: string,
    userId: string,
  ): Promise<boolean> {
    const isRewardClaimed = await this.ticketService.isRewardClaimed(
      ticketId,
      userId,
    );
    if (isRewardClaimed) {
      return false;
    }

    return true;
  }
}
