import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/telegram/telegram.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT);
}
bootstrap();
