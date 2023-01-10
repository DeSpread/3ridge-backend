import { Inject } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../../auth/auth.service';
import { AuthResponse } from '../../../model/auth.model';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Resolver()
export class AuthResolver {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private readonly authService: AuthService,
  ) {}

  @Query(() => AuthResponse)
  async auth(@Args('userId') userId: string) {
    return this.authService.getAccessToken(userId);
  }
}
