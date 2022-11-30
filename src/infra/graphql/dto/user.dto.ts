import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { RoleType } from '../../../constant/roleType';
import { ProjectInput } from './project.dto';

@ArgsType()
@InputType()
export class UserInput {
  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  twitterId: string;

  @Field({ nullable: true })
  discordId: string;

  @Field({ nullable: true })
  role: RoleType;

  @Field(() => [ProjectInput], { nullable: true })
  managedProjects: ProjectInput[];

  @Field(() => [ProjectInput], { nullable: true })
  participatedProjects: ProjectInput[];
}
