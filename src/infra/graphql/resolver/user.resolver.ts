import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../database/service/user.service';
import { User } from '../../schema/user.schema';
import { UserUpdateInput } from '../dto/user.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUserByWallet(@Args('walletAddress') walletAddress: string) {
    return this.userService.createByWalletAddress(walletAddress);
  }

  @Mutation(() => User)
  async createUserByGmail(@Args('gmail') gmail: string) {
    return this.userService.createByGmail(gmail);
  }

  @Mutation(() => User)
  async createUserByEmail(@Args('email') email: string) {
    return this.userService.createByEmail(email);
  }

  @Mutation(() => User)
  async removeUserByName(@Args('name') name: string) {
    return this.userService.remove(name);
  }

  @Mutation(() => User)
  async updateUserByName(
    @Args('name') name: string,
    @Args('userUpdateInput') userUpdateInput: UserUpdateInput,
  ) {
    return this.userService.update(name, userUpdateInput);
  }

  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  async findUserByName(@Args('name') name: string) {
    return this.userService.findByName(name);
  }
}
