import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import {
  UserType,
  RentalMonthFrequency,
  TopRentedCar,
  ExpenseDescriptionAverageCost,
  MonthlyCarExpenseCostAugmentRate
} from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { CarRentMetricService } from './car-rent-metric.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Expense } from '../../models/renting/expense.entity'

const { admin } = UserType

@Controller('car-rents-metrics')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/car-rents-metrics')
export class CarRentMetricController {
  constructor(
    private readonly service: CarRentMetricService,
  ) { }

  @Get('year/:year')
  public async getTotalRevenueByYear(@Param('year') year: number): Promise<number> {
    return this.service.getTotalRevenueByYear(year)
  }

  @Get('quarter/:year/:quarter')
  public async getTotalRevenueByQuarter(
    @Param('year') year: number,
    @Param('quarter') quarter: number,
  ): Promise<number> {
    return this.service.getTotalRevenueByQuarter(year, quarter)
  }

  @Get('month/:year/:month')
  public async getTotalRevenueByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    return this.service.getTotalRevenueByMonth(year, month)
  }

  @Get('week/:year/:week')
  public async getTotalRevenueByWeek(
    @Param('year') year: number,
    @Param('week') week: number,
  ): Promise<number> {
    return this.service.getTotalRevenueByWeek(year, week)
  }

  @Get(':year/month/:month/rents')
  public async getTotalRentsByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    return this.service.getTotalRentsByMonth(year, month)
  }

  @Get(':year/week/:week/rents')
  public async getTotalRentsByWeek(
    @Param('year') year: number,
    @Param('week') week: number,
  ): Promise<number> {
    return this.service.getTotalRentsByWeek(year, week)
  }

  @Get('car-occupancy-rate')
  public async getCarOccupancyRate(): Promise<number> {
    return this.service.getCarOccupancyRate()
  }

  @Get(':year/month/:month/car-occupancy-rate')
  public async getMonthlyCarOccupancyRate(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    return this.service.getMonthlyCarOccupancyRate(year, month)
  }

  @Get('average-duration-of-rentals/:month/:year')
  public async getAverageDurationOfRentalsByMonth(
    @Param('month') month: number,
    @Param('year') year: number
  ): Promise<number> {
    return this.service.getAverageDurationOfRentalsByMonth(year, month)
  }

  @Get('popular-rental-months/:year/:limit')
  public async getPopularRentalMonths(
    @Param('year') year: number,
    @Param('limit') limit: number,
  ): Promise<RentalMonthFrequency[]> {
    return this.service.getPopularRentalMonths(year, limit)
  }

  @Get('top-rented-cars')
  public async getTopRentedCars(): Promise<TopRentedCar[]> {
    return this.service.getTopRentedCars()
  }

  @Get('top-rented-cars/:month/:year')
  public async getTopRentedCarsByMonth(
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<TopRentedCar[]> {
    return this.service.getTopRentedCarsByMonth(month, year)
  }

  @Get('average-expense-cost-by-description')
  public async getAverageExpenseCostByType(): Promise<ExpenseDescriptionAverageCost> {
    return this.service.getAverageExpenseCostByDescription()
  }

  @Get('most-expensive-expenses/:limit')
  public async getMostExpensiveExpenses(@Param('limit') limit: number): Promise<Expense[]> {
    return this.service.getMostExpensiveExpenses(limit)
  }

  @Get('expense-cost-augment-rate')
  public async getExpenseCostAugmentRate(): Promise<MonthlyCarExpenseCostAugmentRate[]> {
    return this.service.getExpenseCostAugmentRate()
  }
}