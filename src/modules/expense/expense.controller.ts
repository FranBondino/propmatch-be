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
  Req,
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
import { User } from '../../models/user.entity'
import { Request } from 'express';
import { ExpenseJobService } from '../jobs/expense-job.service'


const { admin } = UserType

@Controller('expenses')
@UseGuards(JwtAuthGuard, AllowedUsersGuard)
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class ExpenseController {
  constructor(
    private readonly service: ExpenseService,
    private readonly expenseJobService: ExpenseJobService,
  ) { }

  @Get('apartment/:apartmentId')
  async getByApartmentId(
    @Param('apartmentId') apartmentId: string,
    @Query() query: PaginateQueryRaw
  ): Promise<Paginated<Expense>> {
    return this.service.getByApartmentId(apartmentId, query);
  }


  @Get()
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<Expense>> {
    return this.service.getAll(query)
  }

  @Post()
  public async create(@Body() dto: CreateExpenseDto, @Req() req: Request): Promise<Expense> {
    const user = req.user as User
    return this.service.create(dto, user.id)
  }

  @Post('trigger-recurring-expenses')
  public async triggerRecurringExpenses(): Promise<{ message: string }> {
    await this.expenseJobService.triggerRecurringExpensesManually();
    return { message: 'Gastos recurrentes generados exitosamente!' };
  }

  @Get('apartment/:apartmentId/:year/:month')
  async getApartmentExpensesByMonth(
    @Req() req: Request,
    @Param('apartmentId') apartmentId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    const user = req.user as User
    return this.service.getExpensesByMonthforApartment(user.id, apartmentId, year, month)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired): Promise<Expense> {
    return this.service.getById(id, null)
  }

  @Put()
  public async update(@Body() dto: UpdateExpenseDto): Promise<Expense> {
    return this.service.update(dto)
  }

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired): Promise<void> {
    return this.service.deleteById(id)
  }
}
