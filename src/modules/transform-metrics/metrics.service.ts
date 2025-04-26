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
      const result = await this.bookingMetricRepo.query(`
        WITH city_rent_avg AS (
          SELECT city, AVG(monthly_rent) AS avg_rent
          FROM raw_apartments
          WHERE monthly_rent IS NOT NULL
          GROUP BY city
        ),
        appointment_days AS (
          SELECT 
            apartment_id,
            COUNT(id) AS total_appointments,
            SUM(CASE WHEN status = 'Confirmado' THEN 1 ELSE 0 END) AS confirmed_appointments,
            EXTRACT(EPOCH FROM (MAX(start_time::timestamp) - MIN(start_time::timestamp))) / 86400 AS days_span
          FROM raw_appointments
          GROUP BY apartment_id
        )
        INSERT INTO booking_metrics (
          apartment_id, 
          total_appointments, 
          confirmed_appointments, 
          city, 
          average_rent_comparison, 
          appointment_density
        )
        SELECT 
          ra.id AS apartment_id,
          COALESCE(ad.total_appointments, 0) AS total_appointments,
          COALESCE(ad.confirmed_appointments, 0) AS confirmed_appointments,
          ra.city,
          CASE 
            WHEN cra.avg_rent > 0 AND ra.monthly_rent IS NOT NULL
            THEN ((ra.monthly_rent - cra.avg_rent) / cra.avg_rent * 100)
            ELSE 0 
          END AS average_rent_comparison,
          CASE 
            WHEN ad.days_span > 0 
            THEN COALESCE(ad.total_appointments, 0) / ad.days_span 
            ELSE 0 
          END AS appointment_density
        FROM raw_apartments ra
        LEFT JOIN appointment_days ad ON ra.id = ad.apartment_id
        LEFT JOIN city_rent_avg cra ON ra.city = cra.city
        RETURNING *
      `);
      console.log('Generated booking metrics', {
        sample: result.slice(0, 5),
        avg_rent_sample: await this.rawApartmentRepo.query(`
          SELECT city, AVG(monthly_rent) AS avg_rent
          FROM raw_apartments
          WHERE monthly_rent IS NOT NULL
          GROUP BY city
          LIMIT 5
        `)
      });
    } catch (error) {
      console.error('Error transforming data:', error);
      throw error;
    }
  }

  async getTopApartments(limit: number = 10, city?: string) {
    const query = this.bookingMetricRepo.createQueryBuilder('metric')
      .orderBy('metric.confirmed_appointments', 'DESC')
      .take(limit);

    if (city) {
      query.where('metric.city = :city', { city });
    }

    return query.getMany();
  }
}