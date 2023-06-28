import { Injectable } from '@nestjs/common';
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
import { LoggerService } from './logger.service';

/*
 * Treasury Wallet
 * Testnet: 0x6a2b453dae13354acb55c57077b2abdb09990581dac1c3492a8dbb7e0eddf632
 * Mainnet: 0x281c7c340a31adf97c5f26b80cc2cc94bb047da101653c1a118453aa37c3fee7
 * */
@Injectable()
export class AptosService {
  private nftCreator: AptosAccount;
  private client;
  private faucetClient;
  private tokenClient;
  private coinClient;

  constructor(
    private readonly logger: LoggerService,
    private configService: ConfigService,
  ) {
    const className = 'AptosService';
    const aptosNodeEndpoint =
      this.configService.get<string>('aptos.nodeEndpoint');

    this.nftCreator = new AptosAccount(
      HexString.ensure(
        this.configService.get<string>('APTOS_PRIVATE_KEY') as string,
      ).toUint8Array(),
    );
    this.client = new AptosClient(aptosNodeEndpoint);

    this.faucetClient = new FaucetClient(
      aptosNodeEndpoint,
      this.configService.get<string>('global.aptos.faucetUrl'),
    );

    this.tokenClient = new TokenClient(this.client);
    this.coinClient = new CoinClient(this.client);

    this.logger.debug(
      `[${className}] Our NFT creator address: ${this.nftCreator.address()}`,
    );
    this.logger.debug(
      `[${className}] Aptos node endpoint: ${aptosNodeEndpoint}`,
    );
  }

  async claimAptosNFT(
    userWallet: UserWallet,
    aptosNFT: AptosNFT,
  ): Promise<string> {
    const funcName = this.claimAptosNFT.name;
    try {
      this.logger.debug(
        `[${funcName}] Our NFT creator address: ${this.nftCreator.address()}`,
      );
      this.logger.debug(
        `[${funcName}] user try to claim Aptos NFT.userWallet: ${JSON.stringify(
          userWallet,
        )}, Aptos NFT: ${JSON.stringify(aptosNFT)}`,
      );

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
        `[${funcName}] Successful to requested claim transaction of Aptos NFT. txHash: ${txHash}`,
      );
      return txHash;
    } catch (e) {
      this.logger.error(
        `[${funcName}] Failed to offer nft token. error: ${e.message}`,
      );
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
