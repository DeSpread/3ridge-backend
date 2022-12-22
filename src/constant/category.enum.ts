import { registerEnumType } from '@nestjs/graphql';

export enum CategoryType {
  DEFI = 'Defi',
  NFT = 'Nft',
  LAYER1 = 'Layer1',
  LAYER2 = 'Layer2',
}

registerEnumType(CategoryType, { name: 'CategoryType' });
