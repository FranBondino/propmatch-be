import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, FindOptionsWhere, Repository } from 'typeorm';
import { isWithinInterval, subMinutes, addMinutes, endOfDay, startOfDay } from 'date-fns';
import { User } from '../../models/user.entity';
import { Appointment } from '../../models/appointment.entity';
import { Car } from '../../models/renting/car.entity';
import { Apartment } from '../../models/renting/apartment.entity';
import { CreateAppointmentDto, UpdateAppointmentStatusDto } from './appointment.dto';
import { EmailNotificationService } from '../email-notification/email-notification.service';
import { GetAllPaginatedQB } from '../../helpers/pagination.helper';
import { Paginated, PaginateQueryRaw } from '../../types/types';
import { format } from 'date-fns';

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

  public async getAppointmentsByUser(userId: string, query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.car', 'car')
      .leftJoinAndSelect('appointment.apartment', 'apartment')
      .where('appointment.user.id = :userId', { userId });
  
    return GetAllPaginatedQB<Appointment>(qb, query);
  }

  public async getAppointmentsByOwner(ownerId: string, query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.owner', 'owner')
      .leftJoinAndSelect('appointment.car', 'car')
      .leftJoinAndSelect('appointment.apartment', 'apartment')
      .where('appointment.owner.id = :ownerId', { ownerId });
  
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

  public async getAvailableAppointmentTimes(ownerId: string): Promise<string[]> {
    const startTime = 7; // 7 AM
    const endTime = 20; // 8 PM
    const appointmentDuration = 30; // Appointment duration in minutes
    const bufferTime = 15; // Buffer time in minutes
  
    // Get existing appointments for the owner from Monday to Friday
    const today = new Date();
    const startOfWeek = startOfDay(today);
    const endOfWeek = endOfDay(today);
  
    const existingAppointments = await this.repository.find({
      where: {
        owner: { id: ownerId },
        startTime: Between(startOfWeek, endOfWeek),
      },
    });
  
    const availableTimes: string[] = [];
  
    // Check available slots for each day from Monday to Friday
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + dayOffset);
      const dateString = day.toISOString().split('T')[0]; // Format date for output
  
      for (let hour = startTime; hour < endTime; hour++) {
        const startSlot = new Date(dateString + `T${hour.toString().padStart(2, '0')}:00`);
        const endSlot = addMinutes(startSlot, appointmentDuration);
        
        // Check if there's a conflict with existing appointments
        const isAvailable = !existingAppointments.some(appointment => {
          return isWithinInterval(appointment.startTime, {
            start: subMinutes(startSlot, bufferTime),
            end: addMinutes(endSlot, bufferTime),
          });
        });
  
        if (isAvailable) {
          // Format the available time slot to a more readable format
          const formattedTime = format(startSlot, "EEEE, MMMM d, yyyy, h:mm a");
          availableTimes.push(formattedTime); // Add the formatted time slot
        }
      }
    }
  
    return availableTimes;
  }

  public async createAppointment(dto: CreateAppointmentDto, userId: string): Promise<Appointment> {
    const { user, owner, car, apartment } = await this.prepareAppointmentEntities(dto, userId);
    
    await this.validateAppointment(dto, user.id, owner.id, car, apartment);

    const appointment = this.createAppointmentEntity(dto, user, owner, car, apartment);
    
    await this.sendAppointmentNotifications(user, owner, car, apartment);

    return this.repository.save(appointment);
  }

  private async prepareAppointmentEntities(dto: CreateAppointmentDto, userId: string): Promise<{ user: User, owner: User, car?: Car, apartment?: Apartment }> {
    const user = await this.findUserById(userId);
    const owner = await this.findOwnerById(dto.ownerId);
    const { car: foundCar, apartment: foundApartment } = await this.findAssociatedEntities(dto, owner.id);

    return { user, owner, car: foundCar, apartment: foundApartment };
  }

  private async validateAppointment(dto: CreateAppointmentDto, userId: string, ownerId: string, car?: Car, apartment?: Apartment): Promise<void> {
    await this.ensureNoOverlappingAppointments(dto, ownerId);
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  private async findOwnerById(ownerId: string): Promise<User> {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) throw new NotFoundException("Owner not found");
    return owner;
  }

  private async findAssociatedEntities(dto: CreateAppointmentDto, ownerId: string): Promise<{ car?: Car, apartment?: Apartment }> {
    let car: Car | undefined;
    let apartment: Apartment | undefined;

    if (dto.apartmentId) {
      apartment = await this.apartmentRepository.findOne({ where: { id: dto.apartmentId, owner: { id: ownerId } } });
      if (!apartment) throw new NotFoundException('Apartment not found or does not belong to this owner');
    }

    if (dto.carId) {
      car = await this.carRepository.findOne({ where: { id: dto.carId, owner: { id: ownerId } } });
      if (!car) throw new NotFoundException('Car not found or does not belong to this owner');
    }

    if (!apartment && !car) throw new BadRequestException('Either apartmentId or carId must be provided');

    return { car, apartment };
  }

  private async ensureNoOverlappingAppointments(dto: CreateAppointmentDto, ownerId: string): Promise<void> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime); // Updated to use endTime
    const bufferTime = 15; // 15 minutes buffer

    const overlappingAppointments = await this.repository.find({
      where: {
        owner: { id: ownerId },
        startTime: Between(subMinutes(startTime, bufferTime), addMinutes(endTime, bufferTime)),
      },
    });

    if (overlappingAppointments.length) {
      throw new BadRequestException('Appointment time overlaps with an existing appointment');
    }
  }
  
  private createAppointmentEntity(
    dto: CreateAppointmentDto,
    user: User,
    owner: User,
    car?: Car,
    apartment?: Apartment
  ): Appointment {
    return this.repository.create({
      ...dto,
      user,
      car,
      apartment,
      owner, // Associate the owner, who is a User
      status: 'pending',
    });
  }

  

    private async sendAppointmentNotifications(
      user: User,
      owner: User,
      car?: Car,
      apartment?: Apartment
    ): Promise<void> {
      try {
        // Determine the type and details of the appointment
        const appointmentType = car ? 'car' : 'apartment';
        const appointmentDetails = car ? car.model : apartment?.fullAddress;
    
        // Email to the user who made the appointment
        await this.emailNotificationService.sendEmail(
          user.email, 
          'Appointment Request Received',
          `Your appointment request for the ${appointmentType} (${appointmentDetails}) has been received.`
        );
    
        // Email to the owner
        await this.emailNotificationService.sendEmail(
          owner.email, 
          'New Appointment Request',
          `A new appointment request has been made for your ${appointmentType} (${appointmentDetails}).`
        );
      } catch (error) {
        console.error('Error sending email notifications:', error);
      }
    }
}
