import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('booking_metrics')
export class BookingMetric {
  @PrimaryColumn()
  apartment_id: number; // References analytics_apartments.id

  @Column()
  total_appointments: number;

  @Column()
  confirmed_appointments: number;

  @Column()
  city: string; // Denormalized

  @Column('float', { nullable: true })
  average_rent_comparison: number; // % difference from city avg rent

  @Column('float', { nullable: true })
  appointment_density: number; // Appointments per day
}