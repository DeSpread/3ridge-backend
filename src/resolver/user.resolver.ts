import { Query, Resolver } from '@nestjs/graphql';
import { UserDocument } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@Resolver(() => UserDocument)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserDocument], { name: 'users' })
  async findAll() {
    return this.userService.readAll();
  }
}
