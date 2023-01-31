import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IsCompletedQuestByUserIdResponse {
  @Field()
  isCompleted: boolean;
}
