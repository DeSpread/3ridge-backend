import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Ticket } from './ticket.schema';
import { CategoryType } from '../../constant/category.enum';
import {EventType} from "../../constant/event.type";

@Schema()
@ArgsType()
@InputType('ProjectSocialInputType', { isAbstract: true })
@ObjectType()
export class ProjectSocial {
  @Prop()
  @Field({ nullable: true })
  officialUrl: string;

  @Prop()
  @Field({ nullable: true })
  twitterUrl: string;

  @Prop()
  @Field({ nullable: true })
  discordUrl: string;

  @Prop()
  @Field({ nullable: true })
  telegramUrl: string;

  @Prop()
  @Field({nullable: true})
  mediumUrl: string;
}

@Schema({ timestamps: true })
@ArgsType()
@InputType('ProjectInputType', { isAbstract: true })
@ObjectType()
export class Project {
  @Field({ nullable: true })
  _id: string;

  @Prop()
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop()
  @Field({ nullable: true })
  imageUrl: string;

  @Prop({ type: [String], enum: CategoryType })
  @Field(() => [CategoryType], { nullable: true })
  categories: [CategoryType];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  managedUsers: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }] })
  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];

  @Prop()
  @Field({ nullable: true })
  projectSocial: ProjectSocial;

  @Prop()
  @Field({ nullable: true })
  priority: number;

  @Prop()
  @Field(() => [EventType], { nullable: true })
  eventTypes: EventType[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
