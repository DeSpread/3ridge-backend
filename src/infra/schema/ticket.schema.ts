import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Quest } from './quest.schema';
import { User } from './user.schema';
import { RewardPolicy } from '../graphql/dto/policy.dto';

@Schema({ timestamps: true })
@ArgsType()
@InputType('TicketInputType', { isAbstract: true })
@ObjectType()
export class Ticket {
  @Prop()
  @Field({ nullable: true })
  title: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }] })
  @Field(() => [Quest], { nullable: true })
  quests: Quest[];

  @Prop()
  @Field(() => RewardPolicy, { nullable: true })
  rewardPolicy: RewardPolicy;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  participants: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  winners: User[];

  @Prop()
  @Field({ nullable: true })
  completed: boolean;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
