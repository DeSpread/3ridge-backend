import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { EventType } from '../../../constant/eventType';

@ArgsType()
@InputType()
export class TicketInput {
  @Field()
  participant: string;

  @Field({ nullable: true })
  event: EventType;
}
