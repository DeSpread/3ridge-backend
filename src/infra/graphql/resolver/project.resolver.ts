import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProjectService } from '../../database/service/project.service';
import { Project } from '../../schema/project.schema';
import { ProjectCreateInput, ProjectUpdateInput } from '../dto/project.dto';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  async projects() {
    return this.projectService.findAll();
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
