import { ArgsType, Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { Quest } from '../../schema/quest.schema';
import { User } from '../../schema/user.schema';
import { RewardPolicy } from './policy.dto';
import {
  TicketSortType,
  TicketStatusType,
} from '../../../constant/ticket.type';
import { IsEnum, Max, Min } from 'class-validator';

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

  @Field({nullable: true})
  visible: boolean;
}

@ArgsType()
@InputType()
export class TicketStatusInputType {
  @IsEnum(TicketStatusType)
  @Field(() => TicketStatusType, { nullable: true })
  status: TicketStatusType = TicketStatusType.ALL;

  @IsEnum(TicketSortType)
  @Field(() => TicketSortType, { nullable: true })
  sort: TicketSortType = TicketSortType.TRENDING;
}
