import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Project {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  managerList: User[];

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  logoUrl: string;

  @Prop()
  projectUrl: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
