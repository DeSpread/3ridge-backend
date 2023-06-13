import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserModule } from './module/user.module';
import { CommonModule } from './module/common.module';
import { ProjectModule } from './module/project.module';
import { TicketModule } from './module/ticket.module';
import { QuestModule } from './module/quest.module';
import { VerifierModule } from './module/verifier.module';
import { AptosModule } from './module/aptos.module';
import { TestModule } from './module/test.module';
import { LoggerMiddleware } from './service/LoggerMiddleware';
import { TestResolver } from './infra/graphql/resolver/test.resolver';

@Module({
  imports: [
    CommonModule,
    TicketModule,
    UserModule,
    ProjectModule,
    QuestModule,
    VerifierModule,
    AptosModule,
    TestModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
