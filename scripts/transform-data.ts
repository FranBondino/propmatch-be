import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MetricsService } from '../src/modules/transform-metrics/metrics.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const metricsService = app.get(MetricsService);
  await metricsService.transformData();
  console.log('Data transformation complete');
  await app.close();
}
bootstrap();