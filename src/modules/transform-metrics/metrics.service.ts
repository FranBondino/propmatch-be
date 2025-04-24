import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsApartment } from '../../models/analytics-apartment.entity';
import { BookingMetric } from '../../models/booking-metric.entity';
import { RawApartment } from '../../models/raw-apartment.entity';
import { RawAppointment } from '../../models/raw-appointment.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(AnalyticsApartment)
    private analyticsApartmentRepo: Repository<AnalyticsApartment>,
    @InjectRepository(BookingMetric)
    private bookingMetricRepo: Repository<BookingMetric>,
    @InjectRepository(RawApartment)
    private rawApartmentRepo: Repository<RawApartment>,
    @InjectRepository(RawAppointment)
    private rawAppointmentRepo: Repository<RawAppointment>,
  ) {}

  async transformData() {
    try {
      // Step 1: Populate analytics_apartments
      await this.analyticsApartmentRepo.clear();
      await this.analyticsApartmentRepo.query(`
        INSERT INTO analytics_apartments (id, monthly_rent, city, amenities, owner_id)
        SELECT id, monthly_rent, city, amenities, owner_id
        FROM raw_apartments
      `);
      console.log('Transformed analytics apartments');

      // Step 2: Populate booking_metrics
      await this.bookingMetricRepo.clear();
      await this.bookingMetricRepo.query(`
        INSERT INTO booking_metrics (apartment_id, total_appointments, confirmed_appointments, city)
        SELECT 
          ra.id AS apartment_id,
          COUNT(rapp.id) AS total_appointments,
          SUM(CASE WHEN rapp.status = 'Confirmado' THEN 1 ELSE 0 END) AS confirmed_appointments,
          ra.city
        FROM raw_apartments ra
        LEFT JOIN raw_appointments rapp ON ra.id = rapp.apartment_id
        GROUP BY ra.id, ra.city
      `);
      console.log('Generated booking metrics');
    } catch (error) {
      console.error('Error transforming data:', error);
      throw error;
    }
  }

  async getTopApartments(limit: number = 10) {
    return this.bookingMetricRepo.find({
      order: { confirmed_appointments: 'DESC' },
      take: limit,
    });
  }
}