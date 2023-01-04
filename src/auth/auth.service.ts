import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../infra/database/service/user.service';
import { AuthResponse } from '../model/auth.model';
import { ObjectUtil } from '../util/object.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string): Promise<any> {
    const user = await this.userService.findByName(username);
    const authResponse: AuthResponse = new AuthResponse();

    if (ObjectUtil.isNull(user)) {
      return authResponse;
    }

    const payload = { username: user.name };
    authResponse.accessToken = this.jwtService.sign(payload);

    return authResponse;
  }
}
