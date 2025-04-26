import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('bookings')
  async getTopApartments(
    @Query('limit') limit: string,
    @Query('city') city: string,
  ) {
    const parsedLimit = parseInt(limit, 10) || 10;
    return this.metricsService.getTopApartments(parsedLimit, city);
  }
}