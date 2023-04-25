import { registerEnumType } from '@nestjs/graphql';

export enum ChainType {
  EVM = 'EVM',
  APTOS = 'APTOS',
  SUI = 'SUI',
}

registerEnumType(ChainType, { name: 'ChainType' });
