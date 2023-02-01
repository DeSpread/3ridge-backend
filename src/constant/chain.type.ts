import { registerEnumType } from '@nestjs/graphql';

export enum ChainType {
  EVM = 'evm',
  APTOS = 'aptos',
}

registerEnumType(ChainType, { name: 'ChainType' });
