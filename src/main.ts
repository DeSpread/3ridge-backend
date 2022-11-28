import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { User } from './schema/user.schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'warn']
        : ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  await app.listen(3000);
}

bootstrap();
