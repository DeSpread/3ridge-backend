import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleType } from '../../constant/roleType';
import { Field, ObjectType } from '@nestjs/graphql';
import { Project } from './project.schema';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  @Field({ nullable: false })
  username: string;

  @Prop()
  @Field({ nullable: true })
  address: string;

  @Prop()
  @Field({ nullable: true })
  email: string;

  @Prop()
  @Field({ nullable: true })
  twitterId: string;

  @Prop()
  @Field({ nullable: true })
  discordId: string;

  @Prop()
  @Field({ nullable: true })
  role: RoleType;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  @Field(() => [Project], { nullable: true })
  managedProjects: Project[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  @Field(() => [Project], { nullable: true })
  participatedProjects: Project[];
}

export const UserSchema = SchemaFactory.createForClass(User);
