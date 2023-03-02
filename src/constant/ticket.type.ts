import { registerEnumType } from '@nestjs/graphql';

export enum TicketStatusType {
  ALL = 'ALL',
  AVAILABLE = 'AVAILABLE',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
}

registerEnumType(TicketStatusType, { name: 'TicketStatusType' });
