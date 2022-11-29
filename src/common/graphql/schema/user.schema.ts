import { Document } from 'mongoose';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Role } from '../../../constant/role';

@ObjectType()
export class User extends Document {
  @Field()
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

@ArgsType()
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
