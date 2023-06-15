import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AptosRequestClaimNFTResponse } from '../dto/response.dto';
import { AptosService } from '../../database/service/aptos.service';

@Resolver()
export class AptosResolver {
  constructor(private aptosService: AptosService) {}

  // @Query(() => Number)
  // async checkTokenBalanceByWalletAddress(
  //   @Args('collectionName') collectionName: string,
  //   @Args('tokenName') tokenName: string,
  //   @Args('receiverAddress') receiverAddress: string,
  // ) {
  //   return this.aptosService.checkTokenBalance(
  //     collectionName,
  //     tokenName,
  //     receiverAddress,
  //     0,
  //   );
  // }
}
