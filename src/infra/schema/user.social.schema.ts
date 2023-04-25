import { Prop, Schema } from '@nestjs/mongoose';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';

@Schema()
@ArgsType()
@InputType('TelegramUserInputType', { isAbstract: true })
@ObjectType()
export class TelegramUser {
  @Prop()
  @Field({ nullable: false })
  username: string;

  @Prop()
  @Field({ nullable: false })
  id: number;

  @Prop()
  @Field({ nullable: true })
  authDate: number;

  @Prop()
  @Field({ nullable: true })
  firstName: string;

  @Prop()
  @Field({ nullable: true })
  hash: string;

  @Prop()
  @Field({ nullable: true })
  photoUrl: string;
}

@Schema()
@ArgsType()
@InputType('UserSocialInputType', { isAbstract: true })
@ObjectType()
export class UserSocial {
  @Prop()
  @Field({ nullable: true })
  twitterId: string;

  @Prop()
  @Field({ nullable: true })
  telegramUser: TelegramUser;
}
