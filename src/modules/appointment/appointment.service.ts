import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, FindOptionsWhere, Repository } from 'typeorm';
import { addHours, subHours, startOfDay, endOfDay } from 'date-fns';
import { User } from '../../models/user.entity';
import { Appointment } from '../../models/appointment.entity';
import { Car } from '../../models/renting/car.entity';
import { Apartment } from '../../models/renting/apartment.entity';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './appointment.dto';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { GetAllPaginatedQB } from '../../helpers/pagination.helper';
import { Paginated, PaginateQueryRaw } from '../../types/types';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  public async getAllAppointments(query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.car', 'car')
      .leftJoinAndSelect('appointment.apartment', 'apartment');
  
    if (query.search) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('appointment.date = :date', { date: query.search })
            .orWhere('LOWER(user.name) ILIKE :search', { search: `%${query.search.toLowerCase()}%` })
            .orWhere('LOWER(car.name) ILIKE :search', { search: `%${query.search.toLowerCase()}%` })
            .orWhere('LOWER(apartment.name) ILIKE :search', { search: `%${query.search.toLowerCase()}%` });
        })
      );
    }
  
    return GetAllPaginatedQB<Appointment>(qb, query);
  }

  public async getAppointmentById(id: string, options: FindOptionsWhere<Appointment>): Promise<Appointment> {
    const appointment = await this.repository.findOne({
      where: { id },
      relations: ['user', 'car', 'apartment'],
      ...options,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }
  
  public async createAppointment(dto: CreateAppointmentDto, userId: string): Promise<Appointment> {
    // Check if the user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException("user was not found")
    
    let car: Car | undefined
    let apartment: Apartment | undefined

    // Check if the apartment exists, if provided
    if (dto.apartmentId) {
      apartment = await this.apartmentRepository.findOne({
        where: { id: dto.apartmentId },
      });
      if (!apartment) {
        throw new NotFoundException('Apartment not found');
      }
    }

    // Check if the car exists, if provided
    if (dto.carId) {
      car = await this.carRepository.findOne({
        where: { id: dto.carId },
      });
      if (!car) {
        throw new NotFoundException('Car not found');
      }
    }

    // Ensure at least one of apartment or car is provided
    if (!apartment && !car) {
      throw new BadRequestException('Either apartmentId or carId must be provided');
    }

    const appointmentDate = new Date(dto.date);
    const oneHourBefore = subHours(appointmentDate, 1);
    const oneHourAfter = addHours(appointmentDate, 1);
    
    // Check for overlapping appointments
    const overlappingAppointments = await this.repository.find({
      where: [
        {
          car: dto.carId ? { id: dto.carId } : undefined,
          apartment: dto.apartmentId ? { id: dto.apartmentId } : undefined,
          date: Between(oneHourBefore, oneHourAfter),
        },
      ],
    });

    if (overlappingAppointments.length > 0) {
      throw new BadRequestException('There is already an appointment scheduled for this time.');
    }

    // Limit Daily Appointments: Ensure the user has not exceeded the daily limit of appointments
    const startOfToday = startOfDay(new Date());
    const endOfToday = endOfDay(new Date());

    const dailyAppointmentsCount = await this.repository.count({
      where: {
        user: { id: dto.userId },
        date: Between(startOfToday, endOfToday),
      },
    });

    const DAILY_APPOINTMENT_LIMIT = 2; // Example limit

    if (dailyAppointmentsCount >= DAILY_APPOINTMENT_LIMIT) {
      throw new BadRequestException('You have reached the daily appointment limit.');
    }

    // Create the appointment  
    const obj = this.repository.create({
      ...dto,
      user,
      car,
      apartment,
      status: 'pending'
    });

    try {
      // Send confirmation email to the user
      await this.emailNotificationService.sendEmail(
        'franbondino@gmail.com',
        'Appointment Request Received',
        `Your appointment request for ${car ? 'car' : 'apartment'} has been received.`
      );

      // Notify the owner about the new appointment request
      await this.emailNotificationService.sendEmail(
        'franbondino@gmail.com',
        'New Appointment Request',
        `A new appointment request has been made for ${car ? 'car' : 'apartment'}.`
      );
    } catch (error) {
      console.error('Error sending email notifications:', error); // Improved error handling
      // Optionally handle email notification failure
    }

    // Save and return the appointment
    return this.repository.save(obj);
  }

  public async updateAppointmentStatus(dto: UpdateAppointmentStatusDto): Promise<Appointment> {
    // Find the appointment to update
    const appointment = await this.repository.findOne({
      where: { id:dto.id  },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = dto.status;
    const updatedAppointment = await this.repository.save(appointment);

    try {
      // Notify the user about the status update
      await this.emailNotificationService.sendEmail(
        appointment.user.email,
        'Appointment Status Update',
        `Your appointment request has been ${dto.status}.`
      );
    } catch (error) {
      console.error('Error sending email notification:', error); // Improved error handling
      // Optionally handle email notification failure
    }

    return updatedAppointment;
  }
}
