import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { Quest } from '../../schema/quest.schema';
import { User } from '../../schema/user.schema';
import { RewardPolicy } from './policy.dto';

@ArgsType()
@InputType()
export class TicketCreateInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  imageUrl: string;

  @Field(() => [Quest], { nullable: true })
  quests: Quest[];

  @Field({ nullable: true })
  rewardPolicy: RewardPolicy;

  @Field({ nullable: true })
  project: string;

  @Field({ nullable: true })
  untilTime: Date;
}

@ArgsType()
@InputType()
export class TicketUpdateInput extends PartialType(TicketCreateInput) {
  @Field(() => [User], { nullable: true })
  participants: User[];

  @Field(() => [User], { nullable: true })
  winners: User[];

  @Field({ nullable: true })
  completed: boolean;
}
