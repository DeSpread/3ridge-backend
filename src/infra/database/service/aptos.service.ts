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
    collectionName: string,
    nftTokenName: string,
    receiverAddress: string,
  ): Promise<AptosRequestClaimNFTResponse> {
    try {
      const txnHash = await this.tokenClient.offerToken(
        this.nftCreator,
        receiverAddress,
        this.nftCreator.address(),
        collectionName,
        nftTokenName,
        1,
        0,
      );
      await this.client.waitForTransaction(txnHash, { checkSuccess: true });

      this.faucetClient.fundAccount(receiverAddress, 100_000_000);

      return {
        txHash: txnHash,
      } as AptosRequestClaimNFTResponse;
    } catch (e) {
      this.logger.error(`Failed to offer nft token. error: [${e.message}]`);
      throw new ApolloError(e.message, 'BAD_REQUEST_CLAIM_NFT');
    }
  }
}
