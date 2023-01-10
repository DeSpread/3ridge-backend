import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { QuestPolicy } from '../graphql/dto/policy.dto';

@Schema({ timestamps: true })
@ArgsType()
@InputType('QuestInputType', { isAbstract: true })
@ObjectType()
export class Quest {
  @Prop()
  @Field({ nullable: true })
  title: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop()
  @Field(() => QuestPolicy, { nullable: true })
  questPolicy: QuestPolicy;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  completedUsers: User[];
}

export const QuestSchema = SchemaFactory.createForClass(Quest);
