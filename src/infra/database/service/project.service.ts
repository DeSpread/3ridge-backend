import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../../schema/project.schema';
import {
  ProjectCreateInput,
  ProjectUpdateInput,
} from '../../graphql/dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return await this.projectModel
      .find()
      .populate('managedUsers')
      .populate('tickets')
      .exec();
  }

  async findAllByName(name): Promise<Project[]> {
    return await this.projectModel
      .find({ name: name })
      .populate('managedUsers')
      .populate('tickets')
      .exec();
  }

  async create(projectCreateInput: ProjectCreateInput): Promise<Project> {
    const projectModel = new this.projectModel(projectCreateInput);
    return projectModel.save();
  }

  async update(id: string, projectUpdateInput: ProjectUpdateInput) {
    const existingProject = await this.projectModel
      .findOneAndUpdate(
        { _id: id },
        { $set: projectUpdateInput },
        { new: true },
      )
      .exec();

    if (!existingProject) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return existingProject;
  }

  async remove(id: string) {
    return this.projectModel.findByIdAndRemove(id);
  }
}
