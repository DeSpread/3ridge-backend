import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../infra/schema/user.schema';
import { UserResolver } from '../infra/graphql/resolver/user.resolver';
import { UserService } from '../infra/database/service/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
