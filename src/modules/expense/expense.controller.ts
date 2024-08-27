import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { IdRequired } from '../../helpers/helper.dto'
import { Expense } from '../../models/renting/expense.entity'
import { Paginated, PaginateQueryRaw, UserType } from '../../types/types'
import { JwtAuthGuard } from '../security/auth/auth.guard'
import { AllowedUsersGuard } from '../security/authorization/allowed-user-type.guard'
import { AllowedUsers } from '../security/authorization/permission.decorator'
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto'
import { ExpenseService } from './expense.service'
import { ResponseInterceptor } from '../../helpers/response.interceptor'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

const { admin } = UserType

@Controller('expenses')
@AllowedUsers(admin)
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth('admin')
@ApiTags('admin/expenses')
export class ExpenseController {
  constructor(
    private readonly service: ExpenseService,
  ) { }

  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    return this.service.getAll(query)
  }

  @Get('apartment')
  public async getAllApartmentExpenses(@Query() query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    return this.service.getAllApartmentExpenses(query)
  }

  @Get('car')
  public async getAllCarExpenses(@Query() query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    return this.service.getAllCarExpenses(query)
  }


  @Post()
  public async create(@Body() dto: CreateExpenseDto): Promise<Expense> {
    return this.service.create(dto)
  }

  @Get('apartment/:apartmentId/:year/:month')
  async getApartmentExpensesByMonth(
    @Param('apartmentId') apartmentId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.getExpensesByMonthforApartment(apartmentId, year, month)
  }

  @Get('car/:carId/:year/:month')
  async getExpensesByMonthforCar(
    @Param('carId') carId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.getExpensesByMonthforCar(carId, year, month)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired): Promise<Expense> {
    return this.service.getById(id, null)
  }

  @Put()
  public async update(@Body() dto: UpdateExpenseDto): Promise<void> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
