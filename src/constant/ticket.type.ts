import { registerEnumType } from '@nestjs/graphql';

export enum TicketStatusType {
  ALL = 'ALL',
  AVAILABLE = 'AVAILABLE',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
}

export enum TicketSortType {
  TRENDING = 'TRENDING',
  NEWEST = 'NEWEST',
}

registerEnumType(TicketStatusType, { name: 'TicketStatusType' });
registerEnumType(TicketSortType, { name: 'TicketSortType' });
