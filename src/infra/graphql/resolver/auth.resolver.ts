import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../../auth/auth.service';
import { AuthResponse } from '../../../model/auth.model';

@Resolver()
export class AuthResolver {
  private logger: Logger;

  constructor(private readonly authService: AuthService) {
    this.logger = new Logger('AuthResolver');
  }

  @Query(() => AuthResponse)
  async login(@Args('username') username: string) {
    try {
      return this.authService.validateUser(username);
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
