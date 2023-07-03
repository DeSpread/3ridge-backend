import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // TODO: exception layer에서 DI가 안되는 이슈가 있어서 테스트가 필요
  // const loggerService = app.get(LoggerService);
  // app.useGlobalFilters(new AllExceptionsFilter(loggerService));
  await app.listen(3000);
}

bootstrap();
