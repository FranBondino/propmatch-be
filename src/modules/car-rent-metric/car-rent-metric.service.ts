import { Injectable } from '@nestjs/common'
import { Between, Not, IsNull, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import {
  getStartDateOfWeek,
  getEndDateOfWeek,
  calculateMonthFrequency,
} from '../../helpers/date-helpers'
import {
  TopRentedCar,
  RentalMonthFrequency,
  ExpenseDescriptionAverageCost,
  MonthlyCarExpenseCostAugmentRate
} from '../../types/types'
import { CarRent } from '../../models/renting/car-rent.entity'
import { Car } from '../../models/renting/car.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Expense } from '../../models/renting/expense.entity'
import { groupBy } from 'lodash'

@Injectable()
export class CarRentMetricService {
  constructor(
    @InjectRepository(CarRent)
    private readonly carRentRepository: Repository<CarRent>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>
  ) { }

  public async getTotalRevenueByYear(year: number): Promise<number> {
    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year + 1}-01-01`)

    const rents = await this.carRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByQuarter(year: number, quarter: number): Promise<number> {
    const startDate = new Date(`${year}-${(quarter - 1) * 3 + 1}-01`)
    const endDate = new Date(`${year}-${quarter * 3 + 1}-01`)

    const rents = await this.carRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const rents = await this.carRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  public async getTotalRevenueByWeek(year: number, week: number): Promise<number> {
    const startDate = getStartDateOfWeek(year, week)
    const endDate = getEndDateOfWeek(year, week)

    const rents = await this.carRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const totalRevenue = rents.reduce((sum, rent) => sum + rent.cost, 0)
    return totalRevenue
  }

  async getTotalRentsByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const totalRents = await this.carRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    return totalRents
  }

  async getTotalRentsByWeek(year: number, week: number): Promise<number> {
    const startDate = getStartDateOfWeek(year, week)
    const endDate = getEndDateOfWeek(year, week)

    const totalRents = await this.carRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    return totalRents
  }

  public async getCarOccupancyRate(): Promise<number> {
    const totalCars = await this.carRepository.count()
    const activeRents = await this.carRentRepository.find({
      where: {
        startedAt: LessThanOrEqual(new Date()),
        endedAt: MoreThanOrEqual(new Date())
      }
    })
    const rentedCars = activeRents.length

    const carOccupancyRate = (rentedCars / totalCars) * 100

    return Number(carOccupancyRate.toFixed(1))
  }

  async getMonthlyCarOccupancyRate(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)

    const rentedCars = await this.carRentRepository.count({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const totalCars = await this.carRepository.count()

    const carOccupancyRate = (rentedCars / totalCars) * 100

    return Number(carOccupancyRate.toFixed(1))
  }

  public async getAverageDurationOfRentalsByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
  
    const rents = await this.carRentRepository.find({
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

  /*
  public async getPercentageOfCarsRentedByGender(): Promise<GenderPercentage[]> {
    const carCountsByGender = await this.carRentRepository
      .createQueryBuilder('carRent')
      .select('client.gender AS gender')
      .addSelect('COUNT(*) AS count')
      .innerJoin('carRent.client', 'client')
      .groupBy('client.gender')
      .getRawMany()

    const totalRentals = carCountsByGender.reduce((sum, entry) => sum + entry.count, 0)

    const percentages = carCountsByGender.map(entry => ({
      gender: entry.gender,
      percentage: parseFloat(((entry.count / totalRentals) * 100).toFixed(1)),
    }))

    return percentages
  }
*/

  public async getPopularRentalMonths(year: number, limit: number): Promise<RentalMonthFrequency[]> {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    const rents = await this.carRentRepository.find({
      where: {
        startedAt: Between(startDate, endDate),
      },
    })

    const rentalMonths = rents.map(rent => rent.startedAt.getMonth() + 1)
    const frequencyMap = calculateMonthFrequency(rentalMonths)

    const sortedMonths = Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1])

    return sortedMonths.slice(0, limit).map(([month, frequency]) => ({ month, frequency }))
  }

  public async getTopRentedCars(): Promise<TopRentedCar[]> {
    const carRentCounts = await this.carRentRepository
      .createQueryBuilder('carRent')
      .select('carRent.car.id', 'carId')
      .addSelect('car.model', 'model')
      .addSelect('car.make', 'make')
      .addSelect('car.color', 'color')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('carRent.car', 'car')
      .groupBy('carRent.car.id')
      .addGroupBy('car.model')
      .addGroupBy('car.make')
      .addGroupBy('car.color')
      .orderBy('count', 'DESC')
      .getRawMany()

    const topRentedCars: TopRentedCar[] = carRentCounts.map(entry => ({
      carId: entry.carId,
      model: entry.model,
      make: entry.make,
      color: entry.color,
      count: entry.count
    }))

    return topRentedCars
  }

  public async getTopRentedCarsByMonth(month: number, year: number): Promise<TopRentedCar[]> {
    const carRentCounts = await this.carRentRepository
      .createQueryBuilder('carRent')
      .select('carRent.car.id', 'carId')
      .addSelect('car.model', 'model')
      .addSelect('car.make', 'make')
      .addSelect('car.color', 'color')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('carRent.car', 'car')
      .where('EXTRACT(MONTH FROM carRent.startedAt) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM carRent.startedAt) = :year', { year })
      .groupBy('carRent.car.id')
      .addGroupBy('car.model')
      .addGroupBy('car.make')
      .addGroupBy('car.color')
      .orderBy('count', 'DESC')
      .getRawMany()

    const topRentedCars: TopRentedCar[] = carRentCounts.map(entry => ({
      carId: entry.carId,
      model: entry.model,
      make: entry.make,
      color: entry.color,
      count: entry.count
    }))

    return topRentedCars
  }

  public async getAverageExpenseCostByDescription(): Promise<ExpenseDescriptionAverageCost> {
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.description', 'description')
      .addSelect('AVG(expense.cost)', 'averageCost')
      .where('expense.car IS NOT NULL') // 
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
      relations: ['car'],
    })

    return expenses
  }
/*
  public async getExpenseCostAugmentRate(): Promise<MonthlyCarExpenseCostAugmentRate[]> {
    const expenses = await this.expenseRepository.find({
      order: {
        date: 'ASC',
      },
      relations: ['car'],
    })

    const augmentRates: MonthlyCarExpenseCostAugmentRate[] = []

    const groupedExpenses = groupBy(expenses, expense => `${expense.car.id}-${expense.description}`)

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

            const augmentRateEntry: MonthlyCarExpenseCostAugmentRate = {
              month: currentExpense.date.getMonth() + 1,
              year: currentExpense.date.getFullYear(),
              augmentRate: augmentRate,
              expenseDescription: currentExpense.description,
              carModel: currentExpense.car.model,
            }

            augmentRates.push(augmentRateEntry)
          }
        }
      }
    }
    return augmentRates
  }
    */
}