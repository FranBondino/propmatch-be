import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsApartment } from '../../models/analytics-apartment.entity';
import { BookingMetric } from '../../models/booking-metric.entity';
import { MetricsService } from './metrics.service';
import { RawApartment } from '../../models/raw-apartment.entity';
import { RawAppointment } from '../../models/raw-appointment.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        AnalyticsApartment,
        BookingMetric,
        RawApartment,
        RawAppointment
      ]),
    ],
  providers: [MetricsService],
  exports: [MetricsService], // Export to be used in other modules
})

export class MetricsModule {}
