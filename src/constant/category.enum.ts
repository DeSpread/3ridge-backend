import { registerEnumType } from '@nestjs/graphql';

export enum CategoryType {
  Defi = 'defi',
  Nft = 'nft',
}

registerEnumType(CategoryType, { name: 'CategoryType' });
