import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import {
  AptosAccount,
  AptosClient,
  CoinClient,
  HexString,
  TokenClient,
} from 'aptos';
import { AptosRequestClaimNFTResponse } from '../../graphql/dto/response.dto';
import { ApolloError } from 'apollo-server-express';

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
  ) {
    this.nftCreator = new AptosAccount(
      HexString.ensure(
        this.configService.get<string>('aptos.privateKey') as string,
      ).toUint8Array(),
    );
    this.client = new AptosClient(
      this.configService.get<string>('aptos.nodeUrl'),
    );

    this.faucetClient = new AptosClient(
      this.configService.get<string>('aptos.faucetUrl'),
    );

    this.tokenClient = new TokenClient(this.client);
    this.coinClient = new CoinClient(this.client);
  }

  async requestClaimNFT(
    receiverAddress: string,
  ): Promise<AptosRequestClaimNFTResponse> {
    try {
      const txnHash = await this.tokenClient.offerToken(
        this.nftCreator,
        receiverAddress,
        this.nftCreator.address(),
        this.configService.get<string>('aptos.collectionName'),
        this.configService.get<string>('aptos.nftTokenName'),
        1,
        0,
      );
      await this.client.waitForTransaction(txnHash, { checkSuccess: true });
      return {
        txHash: txnHash,
      } as AptosRequestClaimNFTResponse;
    } catch (e) {
      this.logger.error(`Failed to offer nft token. error: [${e.message}]`);
      throw new ApolloError(e.message, 'BAD_REQUEST_CLAIM_NFT');
    }
  }
}
