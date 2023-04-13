import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { QuestGuideType } from '../../../constant/guide.policy';

@Schema({ timestamps: true })
@ArgsType()
@InputType('QuestGuideInputType', { isAbstract: true })
@ObjectType()
export class QuestGuide {
  @Prop({ type: String, enum: QuestGuideType })
  @Field(() => QuestGuideType)
  guidePolicyType: QuestGuideType = QuestGuideType.CONTENT;

  @Prop()
  @Field()
  title: string;

  @Prop()
  @Field()
  description: string;

  @Prop()
  @Field({ nullable: true })
  externalLink: string;
}
