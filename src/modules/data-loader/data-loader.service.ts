import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { RawAppointment } from '../../models/raw-appointment.entity';
import { RawApartment } from '../../models/raw-apartment.entity';

@Injectable()
export class DataLoaderService {
  constructor(
    @InjectRepository(RawApartment)
    private apartmentRepo: Repository<RawApartment>,
    @InjectRepository(RawAppointment)
    private appointmentRepo: Repository<RawAppointment>,
  ) { }

  async loadData() {
    try {
      const apartmentsData = JSON.parse(fs.readFileSync('data/apartments.json', 'utf-8'));
      await this.apartmentRepo.clear();
      await this.apartmentRepo.save(apartmentsData);
      console.log(`Loaded ${apartmentsData.length} apartments`);

     // Load appointments in batches
     const appointmentsData = JSON.parse(fs.readFileSync('data/appointments.json', 'utf-8'));
     await this.appointmentRepo.clear();
     const batchSize = 1000;
     for (let i = 0; i < appointmentsData.length; i += batchSize) {
       const batch = appointmentsData.slice(i, i + batchSize);
       await this.appointmentRepo.save(batch, { chunk: 100 });
       console.log(`Loaded batch ${i / batchSize + 1} of ${Math.ceil(appointmentsData.length / batchSize)}`);
     }
     console.log(`Loaded ${appointmentsData.length} appointments`);
   } catch (error) {
     console.error('Error loading data:', error);
     throw error;
   }
  }
}