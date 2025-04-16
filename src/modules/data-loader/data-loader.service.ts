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

      const appointmentsData = JSON.parse(fs.readFileSync('data/appointments.json', 'utf-8'));
      await this.appointmentRepo.clear();
      await this.appointmentRepo.save(appointmentsData);
      console.log(`Loaded ${appointmentsData.length} appointments`);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
}