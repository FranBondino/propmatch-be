import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('analytics_apartments') // Unique table name
export class AnalyticsApartment {
  @PrimaryColumn()
  id: number; // Matches raw_apartments.id

  @Column()
  monthly_rent: number;

  @Column()
  city: string;

  @Column('jsonb')
  amenities: string[]; // JSONB for querying

  @Column()
  owner_id: string;
}