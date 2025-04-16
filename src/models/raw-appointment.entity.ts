import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('raw_appointments')
export class RawAppointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  renter_id: string;

  @Column()
  apartment_id: number;

  @Column()
  status: 'Pendiente' | 'Confirmado';

  @Column()
  start_time: string;

  @Column()
  end_time: string;

  @Column()
  owner_id: string;
}