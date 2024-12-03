import { FindOptionsWhere, Between, Repository, DeleteResult } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { Expense } from '../../models/renting/expense.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../../models/user.entity'

const {
  EXPENSE_NOT_FOUND,
  APARTMENT_NOT_FOUND,
  CAR_NOT_FOUND
} = errorsCatalogs

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async create(dto: CreateExpenseDto, userId: string): Promise<Expense> {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException("User was not found")

    const apartment = await this.apartmentRepository.findOne({ where: { id: dto.apartmentId } })
    if (!apartment) throw new NotFoundException(APARTMENT_NOT_FOUND)

    const expense = new Expense()
    expense.cost = dto.cost
    expense.date = dto.date
    expense.description = dto.description
    expense.recurring = dto.recurring
    expense.owner = user
    expense.apartment = apartment
    expense.isManual = dto.isManual ?? false

    return this.repository.save(expense)
  }


  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLowerCase()}%'`)
    }

    return GetAllPaginatedQB<Expense>(qb, query)
  }

    public async getAllOwnerExpenses(userId: string, query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
      .leftJoinAndSelect('expense.owner', 'owner') 
      .where('owner.id = :userId', { userId })

  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  public async getById(id: string, options: FindOptionsWhere<Expense>): Promise<Expense> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(EXPENSE_NOT_FOUND)
    return obj
  }

  public async getByApartmentId(apartmentId: string, query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
      .where('apartment.id = :id', { id: apartmentId });
  
    return GetAllPaginatedQB<Expense>(qb, query);
  }


  public async getExpensesByMonthforApartment(userId: string, apartmentId: string, year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const expenses = await this.repository.find({
      where: {
        owner: { id: userId },
        apartment: { id: apartmentId },
        date: Between(startDate, endDate),
      },
    })

    return expenses
  }

  public async findByApartmentId(apartmentId: string): Promise<Expense[]> {
    return this.repository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
      .where('apartment.id = :id', { id: apartmentId })
      .getMany()
  }

  async getPreviousMonthApartmentExpenses(userId: string, apartmentId: string): Promise<Expense[]> {
    const currentDate = new Date()
    let currentYear = currentDate.getFullYear()
    let currentMonth = currentDate.getMonth() + 1
    if (currentMonth === 0) {
      currentMonth = 12
      currentYear -= 1
    }

    const startOfPreviousMonth = new Date(currentYear, currentMonth - 2, 1, 0, 0, 0, 0)
    const endOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0)

    const previousExpenses = await this.repository.find({
      where: {
        owner: { id: userId },
        apartment: { id: apartmentId },
        date: Between(startOfPreviousMonth, endOfPreviousMonth),
        recurring: true, // Ensure only recurring expenses are fetched
      },
    })

    return previousExpenses
  }

  public async update(dto: UpdateExpenseDto): Promise<Expense> {
    const obj = await this.getById(dto.id, null)
  
    const apartment = await this.apartmentRepository.findOne({ where: { id: dto.apartmentId } })
    if (!apartment) throw new NotFoundException(APARTMENT_NOT_FOUND)

    return this.repository.save({ ...obj, ...dto, apartment })
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(EXPENSE_NOT_FOUND)
  }

  public async getTimeUntilNextCron(): Promise<{ days: number; hours: number; minutes: number; seconds: number }> {
    const now = new Date();
    
    // Determine the next cron execution date
    const nextMonth = (now.getMonth() + 1) % 12; // Correctly cycle back to 0 (January) after December
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(); // Handle year transition
    
    const nextCron = new Date(nextYear, nextMonth, 1, 0, 0, 0, 0); // First day of next month at midnight
  
    // Calculate the difference in milliseconds
    const diff = nextCron.getTime() - now.getTime();
  
    // Convert milliseconds into days, hours, minutes, and seconds
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
  
    return { days, hours, minutes, seconds };
  }
  

  public async deleteManualExpenses(): Promise<void> {
    await this.repository.delete({
        isManual: true
    });
  }
}
