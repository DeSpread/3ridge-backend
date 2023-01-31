import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CheckResponse {
  @Field((type) => Boolean)
  isTrue: boolean;
}
