import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleType } from '../../constant/roleType';
import { Field, ObjectType } from '@nestjs/graphql';
import { Project } from './project.schema';

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
  role: RoleType;

  @Prop()
  @Field(() => [Project], { nullable: true })
  managedProjects: Project[];

  @Prop()
  @Field(() => [Project], { nullable: true })
  participatedProjects: Project[];
}

export const UserSchema = SchemaFactory.createForClass(User);
