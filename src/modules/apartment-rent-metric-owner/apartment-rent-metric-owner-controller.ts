import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Req,
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
import { Expense } from '../../models/renting/expense.entity'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApartmentRentMetricOwnerService } from './apartment-rent-metric-owner.service'
import { User } from '../../models/user.entity'
import { Request } from 'express'

const { admin } = UserType

@Controller('apartment-rents-metrics-owner')
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class ApartmentRentMetricOwnerController {
  constructor(
    private readonly service: ApartmentRentMetricOwnerService,
  ) { }

  @Get('year/:year')
  public async getTotalRevenueByYear(@Req() req: Request, @Param('year') year: number): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRevenueByYear(user.id, year)
  }

  @Get('quarter/:year/:quarter')
  public async getTotalRevenueByQuarter(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('quarter') quarter: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRevenueByQuarter(user.id, year, quarter)
  }

  @Get('month/:year/:month')
  public async getTotalRevenueByMonth(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRevenueByMonth(user.id, year, month)
  }

  @Get('week/:year/:week')
  public async getTotalRevenueByWeek(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('week') week: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRevenueByWeek(user.id, year, week)
  }

  @Get(':year/month/:month/rents')
  public async getTotalRentsByMonth(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRentsByMonth(user.id, year, month)
  }

  @Get(':year/week/:week/rents')
  public async getTotalRentsByWeek(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('week') week: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getTotalRentsByWeek(user.id, year, week)
  }

  @Get('apartment-occupancy-rate')
  public async getApartmentOccupancyRate(@Req() req: Request): Promise<number> {
    const user = req.user as User
    return this.service.getApartmentOccupancyRate(user.id)
  }

  @Get(':year/month/:month/apartment-occupancy-rate')
  public async getMonthlyApartmentOccupancyRate(
    @Req() req: Request,
    @Param('year') year: number,
    @Param('month') month: number,
  ): Promise<number> {
    const user = req.user as User
    return this.service.getMonthlyApartmentOccupancyRate(user.id, year, month)
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
  public async getTopRentedApartments(@Req() req: Request): Promise<TopRentedApartment[]> {
    const user = req.user as User
    return this.service.getTopRentedApartments(user.id)
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