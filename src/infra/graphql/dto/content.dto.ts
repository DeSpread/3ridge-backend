import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import {
  ContentEncodingType,
  ContentFormatType,
} from '../../../constant/content.type';

@Schema({ timestamps: true })
@ArgsType()
@InputType('ContentMetadataInputType', { isAbstract: true })
@ObjectType()
export class ContentMetadata {
  @Prop({ type: String, enum: ContentFormatType })
  @Field(() => ContentFormatType)
  contentFormatType: ContentFormatType = ContentFormatType.HTML;

  @Prop({ type: String, enum: ContentEncodingType })
  @Field(() => ContentEncodingType)
  contentEncodingType: ContentEncodingType = ContentEncodingType.BASE64;

  @Prop()
  @Field()
  content: string;
}
