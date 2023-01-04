import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field((type) => String, { nullable: true })
  accessToken: string;
}
