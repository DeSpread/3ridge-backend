import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Role } from '../constant/role';
import { Project } from './project.schema';
import { Field, ObjectType } from '@nestjs/graphql';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  @Prop()
  twitterId: string;

  @Prop()
  discordId: string;

  @Prop()
  role: Role;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  roleInfo: Project[];
}

export const UserSchema = SchemaFactory.createForClass(User);

@ObjectType()
export class UserDocument extends Document {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field()
  number: string;

  @Field()
  email: string;
}
