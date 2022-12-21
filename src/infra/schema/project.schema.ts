import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { Ticket } from './ticket.schema';
import { CategoryType } from '../../constant/category.enum';

@Schema({ timestamps: true })
@ArgsType()
@InputType('ProjectInputType', { isAbstract: true })
@ObjectType()
export class Project {
  @Prop()
  @Field()
  name: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop()
  @Field({ nullable: true })
  thumbnailUrl: string;

  @Prop({ type: [String], enum: CategoryType })
  @Field(() => [CategoryType], { nullable: true })
  categories: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  managedUsers: User[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }] })
  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
