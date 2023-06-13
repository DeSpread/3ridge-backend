import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../../service/user.service';
import { User, UserWallet } from '../../schema/user.schema';
import { UserCreateByGmailInput, UserUpdateInput } from '../dto/user.dto';
import { QueryOptions } from '../dto/argument.dto';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async createUserByWallet(@Args() wallet: UserWallet) {
    return this.userService.createByWallet(wallet);
  }

  @Mutation(() => User)
  async createUserByGmail(
    @Args() userCreateByGmailInput: UserCreateByGmailInput,
  ) {
    return this.userService.createByGmail(userCreateByGmailInput);
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

  // @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async users() {
    return this.userService.findAll();
  }

  @Query(() => [User])
  async usersOrderByRewardPointDesc(@Args() queryOptions: QueryOptions) {
    return this.userService.findAllOrderByRewardPointDesc(queryOptions);
  }

  @Query(() => Number)
  async findRankByUserId(
    @Args('userId') userId: string,
    @Args() queryOptions: QueryOptions,
  ) {
    return this.userService.findRankByUserId(userId, queryOptions);
  }

  @Query(() => User)
  async userByName(@Args('name') name: string) {
    return this.userService.findByName(name);
  }

  @Query(() => User)
  async userByGmail(@Args('gmail') gmail: string) {
    return this.userService.findByGmail(gmail);
  }

  @Query(() => User)
  async userByEmail(@Args('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Query(() => User)
  async userByWalletAddress(@Args('walletAddress') walletAddress: string) {
    return this.userService.findByWalletAddress(walletAddress);
  }

  @Query(() => Boolean)
  async isRegisteredWallet(@Args() userWallet: UserWallet) {
    return this.userService.isRegisteredWallet(userWallet);
  }
}
