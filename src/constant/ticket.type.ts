import { registerEnumType } from '@nestjs/graphql';

export enum TicketStatusType {
  ALL = 'ALL',
  AVAILABLE = 'AVAILABLE',
  COMPLETE = 'COMPLETE',
  MISSED = 'MISSED',
}

registerEnumType(TicketStatusType, { name: 'TicketStatusType' });
