import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { UserWallet } from '../../schema/user.schema';
import { UserSocial } from '../../schema/user.social.schema';

// User
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
