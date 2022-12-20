import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
@ObjectType()
export class Quest {
  @Prop()
  @Field()
  title: string;

  @Prop()
  @Field({ nullable: true })
  description: string;

  @Prop()
  @Field({ nullable: true })
  questPolicy: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  completedUsers: User[];
}

export const QuestSchema = SchemaFactory.createForClass(Quest);
