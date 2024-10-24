import { FindOptionsWhere, Between, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { GetAllPaginatedQB } from '../../helpers/pagination.helper'
import { Apartment } from '../../models/renting/apartment.entity'
import { Paginated, PaginateQueryRaw } from '../../types/types'
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto'
import { errorsCatalogs } from '../../catalogs/errors-catalogs'
import { Expense } from '../../models/renting/expense.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Car } from '../../models/renting/car.entity'
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
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  public async create(dto: CreateExpenseDto, userId: string): Promise<Expense> {
    let entity: Apartment | Car | null = null

    const user = await this.userRepository.findOne({
      where: { id: userId },
    })
    if (!user) throw new NotFoundException("user was not found")

  
    if (dto.apartmentId) {
      entity = await this.apartmentRepository.findOne({
        where: { id: dto.apartmentId },
      })
      if (!entity) throw new NotFoundException(APARTMENT_NOT_FOUND)
    } else if (dto.carId) {
      entity = await this.carRepository.findOne({
        where: { id: dto.carId },
      })
      if (!entity) throw new NotFoundException(CAR_NOT_FOUND)
    }
  
    if (!entity) {
      throw new NotFoundException('Entity (Apartment or Car) not found')
    }
  
    const expense = new Expense()
    expense.cost = dto.cost
    expense.date = dto.date
    expense.description = dto.description
    expense.type = dto.type
    expense.owner = user
  
    // Associate the apartment or car with the expense
    if (dto.apartmentId) {
      expense.apartment = entity as Apartment
    } else if (dto.carId) {
      expense.car = entity as Car
    }
  
    return this.repository.save(expense)
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
      .leftJoinAndSelect('expense.car', 'car') 
  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  public async getAllCarExpenses(query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.car', 'car') 
  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  public async getAllApartmentExpenses(query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment') 
  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  
    public async getAllOwnerExpenses(userId: string, query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.apartment', 'apartment')
      .leftJoinAndSelect('expense.car', 'car')
      .leftJoinAndSelect('expense.owner', 'owner') 
      .where('owner.id = :userId', { userId })

  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  public async getAllCarExpensesByOwner(userId: string, query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    const qb = this.repository.createQueryBuilder('expense')
      .leftJoinAndSelect('expense.car', 'car') 
      .leftJoinAndSelect('expense.owner', 'owner')
      .where('owner.id = :userId', { userId })

  
    if (query.search) {
      qb.andWhere('expense.date = :date', { date: query.search })
      qb.orWhere(`LOWER(expense.description) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }
  
    return GetAllPaginatedQB<Expense>(qb, query)
  }

  public async getAllApartmentExpensesByOwner(userId: string, query: PaginateQueryRaw): Promise<Paginated<Expense>> {
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

  public async getByApartmentId(apartmentId: string, options: FindOptionsWhere<Expense>): Promise<Expense[]> {
    const expenses = await this.repository.find({
      where: { apartment: { id: apartmentId } },
      ...options,
    })

    return expenses
  }

  public async getByCarId(carId: string, options: FindOptionsWhere<Expense>): Promise<Expense[]> {
    const expenses = await this.repository.find({
      where: { car: { id: carId } },
      ...options,
    })

    return expenses
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

  public async getExpensesByMonthforCar(userId: string, carId: string, year: number, month: number): Promise<Expense[]> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const expenses = await this.repository.find({
      where: {
        owner: { id: userId },
        car: { id: carId },
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

  public async findByCarId(carId: string): Promise<Expense[]> {
    return this.repository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.car', 'car')
      .where('car.id = :id', { id: carId })
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
      },
    })

    return previousExpenses
  }

  async getPreviousMonthCarExpenses(carId: string): Promise<Expense[]> {
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
        car: { id: carId },
        date: Between(startOfPreviousMonth, endOfPreviousMonth),
      },
    })

    return previousExpenses
  }

  public async update(dto: UpdateExpenseDto): Promise<void> {
    let entity: Apartment | Car | null = null
    const obj = await this.getById(dto.id, null)
  
    if (dto.apartmentId) {
      entity = await this.apartmentRepository.findOne({
        where: { id: dto.apartmentId },
      })
  
      if (!entity) throw new NotFoundException(APARTMENT_NOT_FOUND)
    } else if (dto.carId) {
      entity = await this.carRepository.findOne({
        where: { id: dto.carId },
      })
  
      if (!entity) throw new NotFoundException(CAR_NOT_FOUND)
    }
  
    await this.repository.save({
      ...obj,
      ...dto,
      entity,
    })
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(EXPENSE_NOT_FOUND)
  }
}
