import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AllExceptionsFilter } from './common/allexceptions.filter';
import { LoggerService } from './service/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // const loggerService = app.get(LoggerService);
  // app.useGlobalFilters(new AllExceptionsFilter(loggerService));
  await app.listen(3000);
}

bootstrap();
