import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { Role } from '../../../constant/role';

@ArgsType()
@InputType()
export class UserInput {
  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  twitterId: string;

  @Field({ nullable: true })
  discordId: string;

  @Field({ nullable: true })
  role: Role;
}
