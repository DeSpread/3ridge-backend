import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Project } from './project.schema';
import * as mongoose from 'mongoose';
import { Ticket } from './ticket.schema';
import { ChainType } from '../../constant/chain.type';

@Schema()
@ArgsType()
@InputType('UserWalletInputType', { isAbstract: true })
@ObjectType()
export class UserWallet {
  @Prop({ type: [String], enum: ChainType })
  @Field(() => ChainType)
  chain: ChainType;

  @Prop()
  @Field()
  address: string;
}

@Schema()
@ArgsType()
@InputType('UserSocialInputType', { isAbstract: true })
@ObjectType()
export class UserSocial {
  @Prop()
  @Field({ nullable: true })
  twitterId: string;
}

@Schema({ timestamps: true })
@ArgsType()
@InputType('UserInputType', { isAbstract: true })
@ObjectType()
export class User {
  @Field({ nullable: true })
  _id: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  @Field({ nullable: true })
  name: string;

  @Prop()
  @Field({ nullable: true })
  profileImageUrl: string;

  @Prop()
  @Field(() => [UserWallet], { nullable: true })
  wallets: [UserWallet];

  @Prop()
  @Field({ nullable: true })
  gmail: string;

  @Prop()
  @Field({ nullable: true })
  email: string;

  @Prop()
  @Field({ nullable: true })
  userSocial: UserSocial;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }] })
  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  @Field(() => [Project], { nullable: true })
  managedProjects: Project[];

  @Prop()
  @Field({ nullable: true })
  rewardPoint: number;
}

export const UserWalletSchema = SchemaFactory.createForClass(UserWallet);
export const UserSchema = SchemaFactory.createForClass(User);
