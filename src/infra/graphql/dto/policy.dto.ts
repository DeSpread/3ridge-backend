import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  QuestPolicyType,
  RewardPolicyType,
} from '../../../constant/rewardPolicyType';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
@ArgsType()
@InputType('RewardPolicyInputType', { isAbstract: true })
@ObjectType()
export class RewardPolicy {
  @Prop({ type: String, enum: RewardPolicyType })
  @Field(() => RewardPolicyType, { nullable: true })
  rewardPolicyType: RewardPolicyType;

  @Prop()
  @Field({ nullable: true })
  context: string;
}

@Schema({ timestamps: true })
@ArgsType()
@InputType('QuestPolicyInputType', { isAbstract: true })
@ObjectType()
export class QuestPolicy {
  @Prop({ type: String, enum: QuestPolicyType })
  @Field(() => QuestPolicyType, { nullable: true })
  questPolicy: QuestPolicyType;

  @Prop()
  @Field({ nullable: true })
  context: string;
}
