import { registerEnumType } from '@nestjs/graphql';

export enum EventType {
  MAIN = 'MAIN',
  RECOMMENDED = 'RECOMMENDED'
}

registerEnumType(EventType, { name: 'EventType' });
