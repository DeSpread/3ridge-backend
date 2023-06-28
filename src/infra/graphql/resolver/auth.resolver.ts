import { Args, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../../auth/auth.service';
import { AuthResponse } from '../../../model/auth.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => AuthResponse)
  async auth(@Args('userId') userId: string) {
    return this.authService.getAccessToken(userId);
  }
}
