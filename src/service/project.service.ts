import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Project } from '../infra/schema/project.schema';
import {
  ProjectCreateInput,
  ProjectUpdateInput,
} from '../infra/graphql/dto/project.dto';
import { ErrorCode } from '../constant/error.constant';
import { QueryOptions } from '../infra/graphql/dto/argument.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async findProjectById(projectId: string): Promise<Project> {
    return await this.projectModel
      .findById(projectId)
      .populate('managedUsers')
      .populate('tickets')
      .populate('projectSocial')
      .exec();
  }

  async findAll(
    filter: FilterQuery<any> = {},
    queryOptions: QueryOptions = new QueryOptions(),
  ): Promise<Project[]> {
    return await this.projectModel
      .find(filter, null, queryOptions)
      .sort({ priority: -1, updatedAt: -1 })
      .populate('managedUsers')
      .populate('tickets')
      .populate('projectSocial')
      .exec();
  }

  async findAllByName(name): Promise<Project[]> {
    return await this.projectModel
      .find({ name: name })
      .populate('managedUsers')
      .populate('tickets')
      .populate('projectSocial')
      .exec();
  }

  async create(projectCreateInput: ProjectCreateInput): Promise<Project> {
    const projectModel = new this.projectModel(projectCreateInput);
    const project = await this.projectModel.exists({
      name: projectCreateInput.name,
    });

    if (project) {
      throw ErrorCode.ALREADY_EXIST_PROJECT;
    }

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
      throw ErrorCode.NOT_FOUND_PROJECT;
    }
    return existingProject;
  }

  async remove(id: string) {
    return this.projectModel.findByIdAndRemove(id);
  }
}
