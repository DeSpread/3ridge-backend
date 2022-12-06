import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../database/service/user.service';
import { User } from '../../schema/user.schema';
import { UserInput } from '../dto/user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  async userByUsername(@Args('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Mutation(() => User)
  async createUser(@Args() userInput: UserInput) {
    return this.userService.create(userInput);
  }

  @Mutation(() => User)
  async updateUserByUsername(username: string, @Args() userInput: UserInput) {
    return this.userService.update(username, userInput);
  }

  @Mutation(() => User)
  async removeUserByUsername(@Args('username') username: string) {
    return this.userService.remove(username);
  }
}
