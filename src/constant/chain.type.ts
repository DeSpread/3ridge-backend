import { registerEnumType } from '@nestjs/graphql';

export enum ChainType {
  EVM = 'evm',
}

registerEnumType(ChainType, { name: 'ChainType' });
