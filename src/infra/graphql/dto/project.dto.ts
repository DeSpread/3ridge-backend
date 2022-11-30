import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { UserInput } from './user.dto';

@ArgsType()
@InputType()
export class ProjectInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  logoUrl: string;

  @Field({ nullable: true })
  projectUrl: string;

  @Field(() => [UserInput], {
    nullable: true,
  })
  managerList: UserInput[];
}
