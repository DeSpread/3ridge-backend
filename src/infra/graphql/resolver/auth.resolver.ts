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
  async auth(@Args('userId') userId: string) {
    return this.authService.getAccessToken(userId);
  }
}
