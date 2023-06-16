import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AptosAccount,
  AptosClient,
  CoinClient,
  FaucetClient,
  HexString,
  TokenClient,
} from 'aptos';
import { ApolloError } from 'apollo-server-express';
import { AptosNFT } from '../model/reward.model';
import { UserWallet } from '../infra/schema/user.schema';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class AptosService {
  private nftCreator: AptosAccount;
  private client;
  private faucetClient;
  private tokenClient;
  private coinClient;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
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

  async claimAptosNFT(
    userWallet: UserWallet,
    aptosNFT: AptosNFT,
  ): Promise<string> {
    try {
      this.logger.debug(
        `user try to claim Aptos NFT.userWallet: [${JSON.stringify(
          userWallet,
        )}], Aptos NFT: [${JSON.stringify(aptosNFT)}]`,
      );

      this.faucetClient.fundAccount(userWallet.address, 100_000_000);

      const txHash = await this.tokenClient.offerToken(
        this.nftCreator,
        HexString.ensure(userWallet.address),
        this.nftCreator.address(),
        aptosNFT.collectionName,
        aptosNFT.tokenName,
        1,
        aptosNFT.tokenPropertyVersion,
      );
      await this.client.waitForTransaction(txHash, { checkSuccess: true });

      this.logger.debug(
        `Successful to requested claim transaction of Aptos NFT. txnHash: ${txHash}`,
      );
      return txHash;
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
