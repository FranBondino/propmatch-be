import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataLoaderService } from '../src/modules/data-loader/data-loader.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const loader = app.get(DataLoaderService);
  await loader.loadData();
  console.log('Data loading complete');
  await app.close();
}
bootstrap();