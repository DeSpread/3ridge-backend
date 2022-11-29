import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../../service/user.service';
import { User, UserInput } from '../schema/user.schema';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  async user(@Args('username') username: string) {
    return this.userService.findByUsername(username);
  }

  @Mutation(() => User)
  async createUser(@Args() userInput: UserInput) {
    return this.userService.create(userInput);
  }

  @Mutation(() => User)
  async updateUser(username: string, @Args() userInput: UserInput) {
    return this.userService.update(username, userInput);
  }

  @Mutation(() => User)
  async removeUser(@Args('username') username: string) {
    return this.userService.remove(username);
  }
}
