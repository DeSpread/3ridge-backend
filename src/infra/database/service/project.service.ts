import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../../schema/project.schema';
import { ProjectInput } from '../../graphql/dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return await this.projectModel.find().exec();
  }

  async create(projectInput: ProjectInput): Promise<Project> {
    const projectModel = new this.projectModel(projectInput);
    return projectModel.save();
  }

  async update(id: string, projectInput: ProjectInput) {
    const existingProject = await this.projectModel
      .findOneAndUpdate({ _id: id }, { $set: projectInput }, { new: true })
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
