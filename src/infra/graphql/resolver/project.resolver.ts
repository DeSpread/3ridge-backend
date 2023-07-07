import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectService } from '../../../service/project.service';
import { Project } from '../../schema/project.schema';
import {ProjectCreateInput, ProjectFilterInputType, ProjectUpdateInput} from '../dto/project.dto';
import { QueryOptions } from '../dto/argument.dto';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projects(@Args() queryOptions: QueryOptions, @Args() projectFilter: ProjectFilterInputType) {
    return this.projectService.findAll(projectFilter.eventTypes ? {eventTypes: {$all: projectFilter.eventTypes}} : {}, queryOptions);
  }

  @Query(() => Project)
  async projectById(@Args('projectId') projectId: string) {
    return this.projectService.findProjectById(projectId);
  }

  @Query(() => [Project])
  async projectByName(@Args('projectName') projectName: string) {
    return this.projectService.findAllByName(projectName);
  }

  @Mutation(() => Project)
  async createProject(@Args() projectCreateInput: ProjectCreateInput) {
    return this.projectService.create(projectCreateInput);
  }

  @Mutation(() => Project)
  async updateProject(
    @Args('projectId') projectId: string,
    @Args() projectUpdateInput: ProjectUpdateInput,
  ) {
    return this.projectService.update(projectId, projectUpdateInput);
  }

  @Mutation(() => Project)
  async removeProject(@Args('projectId') projectId: string) {
    return this.projectService.remove(projectId);
  }
}
