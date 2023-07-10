import { registerEnumType } from '@nestjs/graphql';

export enum PointUpdateType {
  PER_TICKET = 'PER_TICKET',
  PER_QUEST = 'PER_QUEST',
}

registerEnumType(PointUpdateType, { name: 'PointUpdateType' });
