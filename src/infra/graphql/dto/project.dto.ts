import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { UserUpdateInput } from './user.dto';

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

  @Field(() => [UserUpdateInput], {
    nullable: true,
  })
  managerList: UserUpdateInput[];
}
