import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from '../../constant/role';
import { Field, ObjectType } from '@nestjs/graphql';

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  @Field()
  username: string;

  @Prop()
  @Field({ nullable: true })
  address: string;

  @Prop()
  @Field({ nullable: true })
  email: string;

  @Prop()
  @Field({ nullable: true })
  twitterId: string;

  @Prop()
  @Field({ nullable: true })
  discordId: string;

  @Prop()
  @Field({ nullable: true })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
