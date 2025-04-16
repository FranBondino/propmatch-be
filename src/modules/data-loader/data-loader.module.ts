import { Module } from '@nestjs/common';
import { DataLoaderService } from './data-loader.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawApartment } from '../../models/raw-apartment.entity';
import { RawAppointment } from '../../models/raw-appointment.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([
        RawApartment,
        RawAppointment
      ]),
    ],
  providers: [DataLoaderService],
  exports: [DataLoaderService], // Export to be used in other modules
})

export class DataLoaderModule {}
