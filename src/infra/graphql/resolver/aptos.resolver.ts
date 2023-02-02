import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AptosRequestClaimNFTResponse } from '../dto/response.dto';
import { AptosService } from '../../database/service/aptos.service';

@Resolver()
export class AptosResolver {
  constructor(private aptosService: AptosService) {}

  @Mutation(() => AptosRequestClaimNFTResponse)
  async requestClaimNFT(
    @Args('collectionName') collectionName: string,
    @Args('nftTokenName') nftTokenName: string,
    @Args('receiverAddress') receiverAddress: string,
  ) {
    return this.aptosService.requestClaimNFT(
      collectionName,
      nftTokenName,
      receiverAddress,
    );
  }
}
