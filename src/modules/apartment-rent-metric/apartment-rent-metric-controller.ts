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
  TopRentedApartment,
  AverageRentByCity,
  ExpenseDescriptionAverageCost,
  MonthlyApartmentExpenseCostAugmentRate
} from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApartmentRentMetricService } from './apartment-rent-metric.service'
import { Expense } from '../../models/renting/expense.entity'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('apartment-rents-metrics')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/apartment-rent-metric')
export class ApartmentRentMetricController {
  constructor(
    private readonly service: ApartmentRentMetricService,
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

  @Get('apartment-occupancy-rate')
  public async getApartmentOccupancyRate(): Promise<number> {
    return this.service.getApartmentOccupancyRate()
  }

  @Get(':year/month/:month/apartment-occupancy-rate')
  public async getMonthlyApartmentOccupancyRate(
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    return this.service.getMonthlyApartmentOccupancyRate(year, month)
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

  @Get('top-rented-apartments')
  public async getTopRentedApartments(): Promise<TopRentedApartment[]> {
    return this.service.getTopRentedApartments()
  }

  @Get('top-rented-apartments/:month/:year')
  public async getTopRentedApartmentsByMonth(
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<TopRentedApartment[]> {
    return this.service.getTopRentedApartmentsByMonth(month, year)
  }

  @Get('average-rent-by-city')
  public async getAverageRentByCity(): Promise<AverageRentByCity[]> {
    return this.service.getAverageRentByCity()
  }

  @Get('average-expense-cost-by-description')
  public async getAverageExpenseCostByDescription(): Promise<ExpenseDescriptionAverageCost> {
    return this.service.getAverageExpenseCostByDescription()
  }

  @Get('most-expensive-expenses/:limit')
  public async getMostExpensiveExpenses(@Param('limit') limit: number): Promise<Expense[]> {
    return this.service.getMostExpensiveExpenses(limit)
  }

  @Get('expense-cost-augment-rate')
  public async getExpenseCostAugmentRate(): Promise<MonthlyApartmentExpenseCostAugmentRate[]> {
    return this.service.getExpenseCostAugmentRate()
  }
}