import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../../../constant/role';

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  username: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  @Prop()
  twitterId: string;

  @Prop()
  discordId: string;

  @Prop()
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
