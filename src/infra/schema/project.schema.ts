import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Field, ObjectType } from '@nestjs/graphql';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
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
  logoUrl: string;

  @Prop()
  @Field({ nullable: true })
  projectUrl: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  @Field(() => [User], { nullable: true })
  managedUsers: User[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
