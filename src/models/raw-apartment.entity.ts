import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('raw_apartments')
export class RawApartment {
  @PrimaryColumn()
  id: number;

  @Column()
  monthly_rent: number;

  @Column()
  city: string;

  @Column('jsonb')
  amenities: string[];

  @Column()
  owner_id: string;
}