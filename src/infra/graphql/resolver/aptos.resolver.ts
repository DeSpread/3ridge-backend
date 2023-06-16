import { Resolver } from '@nestjs/graphql';
import { AptosService } from '../../../service/aptos.service';

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
