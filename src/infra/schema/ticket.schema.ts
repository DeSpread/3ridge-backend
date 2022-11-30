import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ObjectType } from '@nestjs/graphql';
import { EventType } from '../../constant/eventType';

@Schema({ timestamps: true })
@ObjectType()
export class Ticket {
  @Prop()
  @Field()
  participant: string;

  @Prop()
  @Field({ nullable: true })
  event: EventType;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
