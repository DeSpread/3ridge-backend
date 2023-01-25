import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { QuestPolicyType } from '../../../constant/quest.policy';
import { RewardPolicyType } from '../../../constant/reward.policy';

@Schema({ timestamps: true })
@ArgsType()
@InputType('RewardPolicyInputType', { isAbstract: true })
@ObjectType()
export class RewardPolicy {
  @Prop({ type: String, enum: RewardPolicyType })
  @Field(() => RewardPolicyType)
  rewardPolicyType: RewardPolicyType;

  @Prop()
  @Field()
  rewardPoint: number;

  @Prop()
  @Field()
  context: string;
}

@Schema({ timestamps: true })
@ArgsType()
@InputType('QuestPolicyInputType', { isAbstract: true })
@ObjectType()
export class QuestPolicy {
  @Prop({ type: String, enum: QuestPolicyType })
  @Field(() => QuestPolicyType)
  questPolicy: QuestPolicyType;

  @Prop()
  @Field()
  context: string;
}
