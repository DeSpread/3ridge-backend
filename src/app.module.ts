import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';
import { TicketModule } from './module/ticket.module';
import { QuestModule } from './module/quest.module';
import { VerifierModule } from './module/verifier.module';
import { AptosModule } from './module/aptos.module';
import { TestModule } from './module/test.module';
import { RewardModule } from './module/reward.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { RequestContextModule } from './module/request.context.module';
import { RequestContextMiddleware } from './middleware/request.context.middleware';

@Module({
  imports: [
    RequestContextModule,
    CommonModule,
    TicketModule,
    UserModule,
    ProjectModule,
    QuestModule,
    VerifierModule,
    AptosModule,
    TestModule,
    RewardModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, LoggerMiddleware)
      .forRoutes(
        { path: '*', method: RequestMethod.GET },
        { path: '*', method: RequestMethod.POST },
      );
  }
}
