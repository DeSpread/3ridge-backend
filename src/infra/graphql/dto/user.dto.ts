import { ArgsType, Field, InputType, Int } from '@nestjs/graphql';
import { UserSocial, UserWallet } from '../../schema/user.schema';
import { Max, Min } from 'class-validator';

@ArgsType()
@InputType()
export class UserUpdateInput {
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  gmail: string;

  @Field(() => [UserWallet], { nullable: true })
  wallets: [UserWallet];

  @Field({ nullable: true })
  profileImageUrl: string;

  @Field({ nullable: true })
  rewardPoint: number;

  @Field({ nullable: true })
  userSocial: UserSocial;
}

@ArgsType()
@InputType()
export class UserCreateByGmailInput {
  @Field()
  gmail: string;

  @Field({ nullable: true })
  profileImageUrl: string;
}

@ArgsType()
export class FetchUsersArgs {
  @Field(() => Int)
  @Min(0)
  skip = 0;

  @Field(() => Int)
  @Min(1)
  @Max(50)
  take = 25;
}
