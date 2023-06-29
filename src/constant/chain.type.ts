import { registerEnumType } from '@nestjs/graphql';

export enum ChainType {
  EVM = 'EVM',
  APTOS = 'APTOS',
  SUI = 'SUI',
  STACKS = 'STACKS',
}

registerEnumType(ChainType, { name: 'ChainType' });
