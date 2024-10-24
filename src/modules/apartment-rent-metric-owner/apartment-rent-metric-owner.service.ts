import { Injectable } from '@nestjs/common'
import {
  Between,
  Not,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository
} from 'typeorm'
import {
  getStartDateOfWeek,
  getEndDateOfWeek,
  calculateMonthFrequency,
  groupBy
} from '../../helpers/date-helpers'
import {
  GenderPercentage,
  AverageRentByCity,
  ExpenseDescriptionAverageCost,
  MonthlyApartmentExpenseCostAugmentRate,
  TopRentedApartment,
  RentalMonthFrequency
} from '../../types/types'
import { Expense } from '../../models/renting/expense.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Apartment } from '../../models/renting/apartment.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Logger } from 'winston'

@Injectable()
export class ApartmentRentMetricOwnerService {
  private readonly logger = new Logger();

  constructor(
    @InjectRepository(ApartmentRent)
    private readonly apartmentRentRepository: Repository<ApartmentRent>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>
  ) { }

  public async getTotalRevenueByYear(userId: string, year: number): Promise<number> {
    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year + 1}-01-01`)

    const rents = await this.apartmentRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId }, // Filter by user's apartments
        }
      },
      relations: ['apartment'],
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByQuarter(userId: string, year: number, quarter: number): Promise<number> {
    const startDate = new Date(`${year}-${(quarter - 1) * 3 + 1}-01`)
    const endDate = new Date(`${year}-${quarter * 3 + 1}-01`)

    const rents = await this.apartmentRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId },
        }
      },
      relations: ['apartment'],
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const rents = await this.apartmentRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId },
        }
      },
      relations: ['apartment'],
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByWeek(userId: string, year: number, week: number): Promise<number> {
    const startDate = getStartDateOfWeek(year, week)
    const endDate = getEndDateOfWeek(year, week)

    const rents = await this.apartmentRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId },
        }
      },
      relations: ['apartment'],
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  async getTotalRentsByMonth(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const totalRents = await this.apartmentRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId },
        }
      },
      relations: ['apartment'],
    })

    return totalRents
  }

  async getTotalRentsByWeek(userId: string, year: number, week: number): Promise<number> {
    const startDate = getStartDateOfWeek(year, week)
    const endDate = getEndDateOfWeek(year, week)

    const totalRents = await this.apartmentRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId },
        }
      },
      relations: ['apartment'],

    })

    return totalRents
  }

  public async getApartmentOccupancyRate(userId: string): Promise<number> {
    const totalApartments = await this.apartmentRepository.count({
      where: { owner: { id: userId } }, // Filter by user's apartments
    });
  
    const activeRents = await this.apartmentRentRepository.find({
      where: {
        startedAt: LessThanOrEqual(new Date()),
        endedAt: MoreThanOrEqual(new Date()),
        apartment: {
          owner: { id: userId }, // Filter by user's apartments
        },
      },
      relations: ['apartment'],
    });
  
    const rentedApartments = activeRents.length;
    const apartmentOccupancyRate = (rentedApartments / totalApartments) * 100;
  
    return Number(apartmentOccupancyRate.toFixed(1));
  }

  public async getMonthlyApartmentOccupancyRate(userId: string, year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
  
    const rentedApartments = await this.apartmentRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
        apartment: {
          owner: { id: userId }, // Filter by user's apartments
        },
      },
      relations: ['apartment'],
    });
  
    const totalApartments = await this.apartmentRepository.count({
      where: { owner: { id: userId } }, // Filter by user's apartments
    });
  
    const apartmentOccupancyRate = (rentedApartments / totalApartments) * 100;
    return Number(apartmentOccupancyRate.toFixed(1));
  }

  public async getAverageDurationOfRentalsByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const rents = await this.apartmentRentRepository.find({
      where: {
        endedAt: Not(IsNull()), // Exclude rentals where endedAt is null
        startedAt: Between(startDate, endDate), // Filter by month
      },
    });

    if (rents.length === 0) {
      return 0; // Return 0 if there are no rentals with an end date in the specified month
    }

    const totalDuration = rents.reduce((sum, rent) => {
      const startDate = rent.startedAt;
      const endDate = rent.endedAt;

      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInDays = durationInMilliseconds / (24 * 60 * 60 * 1000); // Convert to days

      return sum + durationInDays;
    }, 0);

    const averageDurationInDays = totalDuration / rents.length;
    return Number(averageDurationInDays.toFixed(1));
  }

  public async getPopularRentalMonths(year: number, limit: number): Promise<RentalMonthFrequency[]> {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    const rents = await this.apartmentRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const rentalMonths = rents.map(rent => rent.startedAt.getMonth() + 1)
    const frequencyMap = calculateMonthFrequency(rentalMonths)

    const sortedMonths = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1])

    return sortedMonths.slice(0, limit).map(([month, frequency]) => ({ month, frequency }))
  }
  public async getTopRentedApartments(userId: string): Promise<TopRentedApartment[]> {
    const apartmentRentCounts = await this.apartmentRentRepository
      .createQueryBuilder('apartmentRent')
      .select('apartmentRent.apartment.id', 'apartmentId')
      .addSelect('apartment.fullAddress', 'address')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('apartmentRent.apartment', 'apartment')
      .where('apartment.owner.id = :userId', { userId }) 
      .groupBy('apartmentRent.apartment.id')
      .addGroupBy('apartment.fullAddress')
      .orderBy('count', 'DESC')
      .getRawMany();

    const topRentedApartments: TopRentedApartment[] = apartmentRentCounts.map(
      entry => ({
        apartmentId: entry.apartmentId,
        address: entry.address,
        count: entry.count,
      }),
    );

    return topRentedApartments;
  }

  public async getTopRentedApartmentsByMonth(month: number, year: number): Promise<TopRentedApartment[]> {
    const apartmentRentCounts = await this.apartmentRentRepository
      .createQueryBuilder('apartmentRent')
      .select('apartmentRent.apartment.id', 'apartmentId')
      .addSelect('apartment.fullAddress', 'address')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('apartmentRent.apartment', 'apartment')
      .where('EXTRACT(MONTH FROM apartmentRent.startedAt) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM apartmentRent.startedAt) = :year', { year })
      .groupBy('apartmentRent.apartment.id')
      .addGroupBy('apartment.fullAddress')
      .orderBy('count', 'DESC')
      .getRawMany()

    const topRentedApartments: TopRentedApartment[] = apartmentRentCounts.map(entry => ({
      apartmentId: entry.apartmentId,
      address: entry.address,
      count: entry.count,
    }))

    return topRentedApartments
  }

  public async getAverageRentByCity(): Promise<AverageRentByCity[]> {
    const averageRents: AverageRentByCity[] = []

    // Retrieve unique cities from apartments
    const cities: { city: string }[] = await this.apartmentRepository
      .createQueryBuilder('apartment')
      .select('DISTINCT apartment.city', 'city')
      .getRawMany()

    // Calculate average rent for each city
    for (const { city } of cities) {
      const { averageRent } = await this.apartmentRentRepository
        .createQueryBuilder('apartmentRent')
        .select('AVG(apartmentRent.cost)', 'averageRent')
        .innerJoin('apartmentRent.apartment', 'apartment')
        .where('apartment.city = :city', { city })
        .getRawOne()

      averageRents.push({ city, averageRent })
    }

    return averageRents
  }

  public async getAverageExpenseCostByDescription(): Promise<ExpenseDescriptionAverageCost> {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.description', 'description')
      .addSelect('AVG(expense.cost)', 'averageCost')
      .where('expense.apartment IS NOT NULL') // 
      .groupBy('expense.description')
      .getRawMany()

    return expenses.map((expense: any) => ({
      description: expense.description,
      averageCost: Math.round(expense.averageCost * 10) / 10,
    })) as ExpenseDescriptionAverageCost;
  }

  public async getMostExpensiveExpenses(limit: number): Promise<Expense[]> {
    const expenses = await this.expenseRepository.find({
      select: ['id', 'description', 'date', 'cost'],
      order: {
        cost: 'DESC',
      },
      take: limit,
      relations: ['apartment'],
    })

    return expenses
  }

  public async getExpenseCostAugmentRate(): Promise<MonthlyApartmentExpenseCostAugmentRate[]> {
    const expenses = await this.expenseRepository.find({
      order: {
        date: 'ASC',
      },
      relations: ['apartment'],
    })

    const augmentRates: MonthlyApartmentExpenseCostAugmentRate[] = []

    const groupedExpenses = groupBy(expenses, expense => `${expense.apartment.id}-${expense.description}`)

    for (const key of Object.keys(groupedExpenses)) {
      const expenseGroup = groupedExpenses[key]
      expenseGroup.sort((a, b) => a.date.getTime() - b.date.getTime())

      for (let i = 1; i < expenseGroup.length; i++) {
        const previousExpense = expenseGroup[i - 1]
        const currentExpense = expenseGroup[i]

        if (previousExpense.date.getMonth() !== currentExpense.date.getMonth()) {
          const previousCost = previousExpense ? previousExpense.cost : null
          const currentCost = currentExpense.cost

          if (previousCost !== null) {
            const augmentRate = Number(((currentCost - previousCost) / previousCost * 100).toFixed(1))

            const augmentRateEntry: MonthlyApartmentExpenseCostAugmentRate = {
              month: currentExpense.date.getMonth() + 1,
              year: currentExpense.date.getFullYear(),
              augmentRate: augmentRate,
              expenseDescription: currentExpense.description,
              apartmentAddress: currentExpense.apartment.fullAddress,
            }

            augmentRates.push(augmentRateEntry)
          }
        }
      }
    }
    return augmentRates
  }
}