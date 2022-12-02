import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { EventType } from '../../constant/eventType';
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
@ObjectType()
export class Ticket {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @Field()
  participatedUser: User;

  @Prop()
  @Field({ nullable: true })
  event: EventType;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
