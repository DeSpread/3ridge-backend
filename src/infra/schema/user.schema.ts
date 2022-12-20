import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { Project } from './project.schema';
import * as mongoose from 'mongoose';
import { Ticket } from './ticket.schema';

@Schema()
@ObjectType()
export class UserWallet {
  @Prop()
  @Field({ nullable: false })
  chain: string;

  @Prop()
  @Field({ nullable: false })
  address: string;
}

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  @Field({ nullable: false })
  name: string;

  @Prop()
  @Field({ nullable: true })
  profileImageUrl: string;

  @Prop({ type: UserWallet })
  @Field(() => [UserWallet], { nullable: true })
  wallet: UserWallet;

  @Prop()
  @Field({ nullable: true })
  gmail: string;

  @Prop()
  @Field({ nullable: true })
  email: string;

  @Prop()
  @Field({ nullable: true })
  twitterId: string;

  @Prop()
  @Field({ nullable: true })
  discordId: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }] })
  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }] })
  @Field(() => [Project], { nullable: true })
  managedProjects: Project[];
}

export const UserWalletSchema = SchemaFactory.createForClass(UserWallet);
export const UserSchema = SchemaFactory.createForClass(User);
