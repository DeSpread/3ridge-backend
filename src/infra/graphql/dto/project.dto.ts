import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { CategoryType } from '../../../constant/category.enum';
import { User } from '../../schema/user.schema';
import { Ticket } from '../../schema/ticket.schema';

@ArgsType()
@InputType()
export class ProjectCreateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  thumbnailUrl: string;

  @Field(() => [CategoryType], { nullable: true })
  categories: CategoryType[];

  @Field(() => [User], { nullable: true })
  managedUsers: User[];

  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];
}
