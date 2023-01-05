import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../infra/database/service/user.service';
import { AuthResponse } from '../model/auth.model';
import { ObjectUtil } from '../util/object.util';
import { ApolloError } from 'apollo-server-express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async getAccessToken(userId: string): Promise<any> {
    let exist;

    try {
      exist = await this.userService.isExistById(userId);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new ApolloError(e.message, 'BAD_REQUEST');
      }
    }

    if (ObjectUtil.isNull(exist)) {
      throw new ApolloError('Does not exist user', 'NOT_EXIST_USER');
    }

    const authResponse: AuthResponse = new AuthResponse();
    const payload = { userId: userId };
    authResponse.accessToken = this.jwtService.sign(payload);

    return authResponse;
  }
}
