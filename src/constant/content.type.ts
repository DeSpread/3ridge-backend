import { registerEnumType } from '@nestjs/graphql';

export enum ContentFormatType {
  HTML = 'HTML',
  MARKDOWN_V2 = 'MARKDOWN_V2',
}

export enum ContentEncodingType {
  BASE64 = 'BASE64',
}

registerEnumType(ContentFormatType, { name: 'ContentFormatType' });
registerEnumType(ContentEncodingType, { name: 'ContentEncodingType' });
