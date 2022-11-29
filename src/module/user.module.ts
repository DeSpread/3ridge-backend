import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from '../controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../common/database/schema/user.schema';
import { UserResolver } from '../common/graphql/resolver/user.resolver';
import { UserService } from '../service/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ConfigModule,
  ],
  providers: [UserResolver, UserService],
  controllers: [UserController],
})
export class UserModule {}
