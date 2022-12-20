import { ArgsType, Field, InputType } from '@nestjs/graphql';

@ArgsType()
@InputType()
class UserWalletInput {
  @Field({ nullable: true })
  chain: string;

  @Field({ nullable: true })
  address: string;
}

@ArgsType()
@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  gmail: string;

  @Field(() => UserWalletInput, { nullable: true })
  wallet: UserWalletInput;

  @Field({ nullable: true })
  profileImageUrl: string;
}
