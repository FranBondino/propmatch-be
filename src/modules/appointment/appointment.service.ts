import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, FindOptionsWhere, In, Repository } from 'typeorm';
import { isWithinInterval, subMinutes, addMinutes, endOfDay, startOfDay, addDays, differenceInDays } from 'date-fns';
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
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    private readonly emailNotificationService: EmailNotificationService,
  ) { }

  public async getAllAppointments(query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.apartment', 'apartment');

    if (query.search) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('appointment.date = :date', { date: query.search })
            .orWhere('LOWER(user.name) ILIKE :search', { search: `%${query.search.toLowerCase()}%` })
            .orWhere('LOWER(apartment.name) ILIKE :search', { search: `%${query.search.toLowerCase()}%` });
        })
      );
    }
    return GetAllPaginatedQB<Appointment>(qb, query);
  }

  public async getAppointmentsByUser(userId: string, query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.apartment', 'apartment')
      .where('appointment.user.id = :userId', { userId });

    return GetAllPaginatedQB<Appointment>(qb, query);
  }

  public async getAppointmentsByOwner(ownerId: string, query: PaginateQueryRaw): Promise<Paginated<Appointment>> {
    const qb = this.repository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.owner', 'owner')
      .leftJoinAndSelect('appointment.apartment', 'apartment')
      .where('appointment.owner.id = :ownerId', { ownerId });

    return GetAllPaginatedQB<Appointment>(qb, query);
  }


  public async getAppointmentById(id: string, options: FindOptionsWhere<Appointment>): Promise<Appointment> {
    const appointment = await this.repository.findOne({
      where: { id },
      relations: ['user', 'apartment'],
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
      where: { id: dto.id },
      relations: ['user', 'owner', 'apartment'], // Include related entities
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
        'Actualizacion del Estado del Turno',
        `Tu turno ha sido ${dto.status}.`
      );
    } catch (error) {
      console.error('Error al enviar email de notificacion:', error); // Improved error handling
      // Optionally handle email notification failure
    }

    return updatedAppointment;
  }

  public async getAvailableAppointmentTimes(ownerId: string): Promise<string[]> {
    const startTime = 7; // 7 AM
    const endTime = 20; // 8 PM
    const appointmentDuration = 30; // Appointment duration in minutes
    const bufferTime = 15; // Buffer time in minutes

    // Get the date range starting from tomorrow until two weeks later
    const today = addDays(new Date(), 1);
    const twoWeeksLater = addDays(today, 14);

    // Get existing appointments for the owner from tomorrow until two weeks later
    const existingAppointments = await this.repository.find({
      where: {
        owner: { id: ownerId },
        startTime: Between(today, twoWeeksLater),
        status: In(['Pendiente', 'Confirmado']) //filter to count only confirmed or pending appointments
      },
    });

    const availableTimes: string[] = [];

    // Loop through each day from tomorrow until two weeks from now
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const day = addDays(today, dayOffset);
      const dateString = day.toISOString().split('T')[0]; // ISO 8601 date string

      // Loop through each hour slot between startTime and endTime
      for (let hour = startTime; hour < endTime; hour++) {
        const startSlot = new Date(dateString + `T${hour.toString().padStart(2, '0')}:00:00.000Z`);
        const endSlot = addMinutes(startSlot, appointmentDuration);

        // Check if there's a conflict with existing appointments
        const isAvailable = !existingAppointments.some(appointment => {
          return isWithinInterval(appointment.startTime, {
            start: subMinutes(startSlot, bufferTime),
            end: addMinutes(endSlot, bufferTime),
          });
        });

        if (isAvailable) {
          availableTimes.push(startSlot.toISOString()); // Return in ISO 8601 format
        }
      }
    }

    return availableTimes;
  }



  public async createAppointment(dto: CreateAppointmentDto, userId: string): Promise<Appointment> {
    const { user, owner, apartment } = await this.prepareAppointmentEntities(dto, userId);

    await this.validateAppointment(dto, owner.id);

    const appointment = this.createAppointmentEntity(dto, user, owner, apartment);

    await this.sendAppointmentNotifications(user, owner, apartment);

    return this.repository.save(appointment);
  }

  private async prepareAppointmentEntities(dto: CreateAppointmentDto, userId: string): Promise<{ user: User, owner: User, apartment?: Apartment }> {
    const user = await this.findUserById(userId);
    const owner = await this.findOwnerById(dto.ownerId);
    const { apartment: foundApartment } = await this.findAssociatedEntities(dto, owner.id);

    return { user, owner, apartment: foundApartment };
  }

  private async validateAppointment(dto: CreateAppointmentDto, ownerId: string): Promise<void> {
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

    if (!apartment) throw new BadRequestException('Either apartmentId or carId must be provided');

    return { apartment };
  }

  private async ensureNoOverlappingAppointments(dto: CreateAppointmentDto, ownerId: string): Promise<void> {
    const startTime = new Date(dto.startTime);
    const appointmentDuration = 30; // Appointment duration in minutes
    const endTime = addMinutes(startTime, appointmentDuration); // Automatically set endTime to 30 minutes after startTime
    const bufferTime = 15; // 15 minutes buffer

    // Find overlapping appointments with buffer time applied
    const overlappingAppointments = await this.repository.find({
      where: {
        owner: { id: ownerId },
        startTime: Between(subMinutes(startTime, bufferTime), addMinutes(endTime, bufferTime)),
      },
    });

    // Throw error if there are overlapping appointments
    if (overlappingAppointments.length) {
      throw new BadRequestException('Horario del turno coincide con turno existente');
    }
  }

  private createAppointmentEntity(
    dto: CreateAppointmentDto,
    user: User,
    owner: User,
    apartment?: Apartment
  ): Appointment {
    return this.repository.create({
      ...dto,
      user,
      apartment,
      owner, // Associate the owner, who is a User
      status: 'Pendiente',
    });
  }



  private async sendAppointmentNotifications(
    user: User,
    owner: User,
    apartment?: Apartment
  ): Promise<void> {
    try {
      // Determine the type and details of the appointment
      const appointmentDetails = apartment.fullAddress;

      // Email to the user who made the appointment
      await this.emailNotificationService.sendEmail(
        user.email,
        'Appointment Request Received',
        `Tu solicitud de turno para la propiedad en calle (${appointmentDetails}) ha sido enviada.`
      );

      // Email to the owner
      await this.emailNotificationService.sendEmail(
        owner.email,
        'New Appointment Request',
        `Un nuevo turno ha sido solicitado para tu propiedad en calle (${appointmentDetails}).`
      );
    } catch (error) {
      console.error('Error al enviar email de notificacion:', error);
    }
  }

  public async cancelAppointment(appointmentId: string, userId: string): Promise<void> {
    const appointment = await this.repository.findOne({
      where: [
        { id: appointmentId, user: { id: userId } },
        { id: appointmentId, owner: { id: userId } }
      ],
      relations: ['user', 'owner', 'apartment'], // Include related entities
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const currentDate = new Date();
    const appointmentStartTime = new Date(appointment.startTime);

    // Check if the appointment is at least 2 days away
    const daysUntilAppointment = differenceInDays(appointmentStartTime, currentDate);
    if (daysUntilAppointment < 2) {
      throw new BadRequestException('Solo puedes cancelar turnos, con dos dias de anterioridad a la fecha');
    }

    // Cancel the appointment
    appointment.status = 'Cancelado';
    await this.repository.save(appointment);

    // Notify the user and owner about the cancellation
    await this.sendCancellationNotifications(appointment.user, appointment.owner, appointment.apartment);
  }

  private async sendCancellationNotifications(
    user: User,
    owner: User,
    apartment?: Apartment
  ): Promise<void> {
    try {
      // Determine the type and details of the appointment
      const appointmentDetails = apartment?.fullAddress;

      // Email to the user about the cancellation
      await this.emailNotificationService.sendEmail(
        user.email,
        'Turno cancelado',
        `Tu turno para la propiedad en calle (${appointmentDetails}) ha sido cancelado.`
      );

      // Email to the owner about the cancellation
      await this.emailNotificationService.sendEmail(
        owner.email,
        'Turno cancelado',
        `Tu turno para la propiedad en calle (${appointmentDetails}) ha sido cancelado por el cliente.`
      );
    } catch (error) {
      console.error('Error al enviar el mail de notificacion de la cancelacion:', error);
    }
  }

}
