import { registerEnumType } from '@nestjs/graphql';

export enum ContentFormatType {
  HTML = 'HTML',
  MARKDOWN_V2 = 'MARKDOWN_V2',
  TEXT = 'TEXT',
}

export enum ContentEncodingType {
  NONE = 'NONE',
  BASE64 = 'BASE64',
}

registerEnumType(ContentFormatType, { name: 'ContentFormatType' });
registerEnumType(ContentEncodingType, { name: 'ContentEncodingType' });
