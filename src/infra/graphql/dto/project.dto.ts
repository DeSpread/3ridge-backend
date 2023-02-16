import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CategoryType } from '../../../constant/category.enum';
import { Ticket } from '../../schema/ticket.schema';
import { Prop } from '@nestjs/mongoose';
import { ProjectSocial } from '../../schema/project.schema';

@ArgsType()
@InputType()
export class ProjectCreateInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  imageUrl: string;

  @Field(() => [CategoryType], { nullable: true })
  categories: CategoryType[];

  @Prop()
  @Field({ nullable: true })
  projectSocial: ProjectSocial;
}

@ArgsType()
@InputType()
export class ProjectUpdateInput extends PartialType(ProjectCreateInput) {
  @Field(() => [Ticket], { nullable: true })
  tickets: Ticket[];
}
