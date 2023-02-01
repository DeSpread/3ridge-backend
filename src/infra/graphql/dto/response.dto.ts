import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IsCompletedQuestByUserIdResponse {
  @Field()
  questId: string;

  @Field()
  isCompleted: boolean;
}

@ObjectType()
export class AptosRequestClaimNFTResponse {
  @Field()
  txHash: string;
}

@ObjectType()
export class ParticipateTicketOfUserResponse {
  @Field()
  isParticipated: boolean;
}
