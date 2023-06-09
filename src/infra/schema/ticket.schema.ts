import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Quest } from './quest.schema';
import { User } from './user.schema';
import { RewardPolicy } from '../graphql/dto/policy.dto';
import { Project } from './project.schema';
import { EventType } from '../../constant/event.type';
import { ContentMetadata } from '../graphql/dto/content.dto';
import { PointUpdateType } from '../../constant/point.type';

@Schema({ timestamps: true })
@ArgsType()
@InputType('TicketInputType', { isAbstract: true })
@ObjectType()
export class Ticket {
  @Field({ nullable: true })
  _id: string;

  @Prop()
  @Field({ nullable: true })
  title: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop()
  @Field({ nullable: true })
  description_v2: ContentMetadata;

  @Prop()
  @Field({ nullable: true })
  imageUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  @Field(() => Project, { nullable: true })
  project: Project;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }] })
  @Field(() => [Quest], { nullable: true })
  quests: Quest[];

  @Prop()
  @Field(() => RewardPolicy, { nullable: true })
  rewardPolicy: RewardPolicy;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  participants: User[];

  @Prop()
  @Field({ nullable: true })
  participantCount: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  completedUsers: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  winners: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  rewardClaimedUsers: User[];

  @Prop()
  @Field({ nullable: true })
  completed: boolean;

  @Prop()
  @Field({ nullable: true })
  visible: boolean;

  @Prop()
  @Field({ nullable: true })
  beginTime: Date;

  @Prop()
  @Field({ nullable: true })
  untilTime: Date;

  @Prop()
  @Field({ nullable: true })
  priority: number;

  @Prop()
  @Field(() => [EventType], { nullable: true })
  eventTypes: EventType[];

  @Prop()
  @Field({ nullable: true })
  pointUpdateType: PointUpdateType;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
