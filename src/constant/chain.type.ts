import { registerEnumType } from '@nestjs/graphql';

export enum ChainType {
  EVM = 'EVM',
  APTOS = 'APTOS',
}

registerEnumType(ChainType, { name: 'ChainType' });
