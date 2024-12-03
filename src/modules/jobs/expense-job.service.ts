import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ExpenseService } from '../expense/expense.service'
import { ApartmentService } from '../apartment/apartment.service'
import { CreateExpenseDto } from '../expense/expense.dto'
import { UserService } from '../security/user/user.service'
import { Paginated } from 'src/types/types'

@Injectable()
export class ExpenseJobService {
  constructor(
    private readonly apartmentService: ApartmentService,
    private readonly expenseService: ExpenseService,
    private readonly userService: UserService,
  ) { }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async createExpensesForCurrentMonth(isManual: boolean = false): Promise<void> {
    // Get all users (owners)
    const owners = await this.userService.getAllOwners();

    for (const owner of owners) {
      // Fetch apartments and cars for the current user
      const apartments = await this.apartmentService.findByOwnerId(owner.id);
      //const cars = await this.carService.findByOwnerId(user.id);

      // Create expenses for apartments
      for (const apartment of apartments) {
        const previousMonthExpenses = await this.expenseService.getPreviousMonthApartmentExpenses(owner.id, apartment.id);

        for (const expense of previousMonthExpenses) {
          const newApartmentExpenseDto: CreateExpenseDto = {
            apartmentId: apartment.id,
            date: new Date(),
            cost: expense.cost,
            description: expense.description,
            isManual
          };

          await this.expenseService.create(newApartmentExpenseDto, owner.id);  // Pass user ID when creating the expense
        }
      }

    }
  }

  public async createExpensesForCurrentMonthDemo(isManual: boolean): Promise<void> {
    // Get all users (owners)
    const owners = await this.userService.getAllOwners();

    for (const owner of owners) {
      // Fetch apartments and cars for the current user
      const apartments = await this.apartmentService.findByOwnerId(owner.id);
      //const cars = await this.carService.findByOwnerId(user.id);

      // Create expenses for apartments
      for (const apartment of apartments) {
        const previousMonthExpenses = await this.expenseService.getPreviousMonthApartmentExpenses(owner.id, apartment.id);

        for (const expense of previousMonthExpenses) {
          const newApartmentExpenseDto: CreateExpenseDto = {
            apartmentId: apartment.id,
            date: new Date(),
            cost: expense.cost,
            recurring: true,
            description: expense.description,
            isManual
          };

          await this.expenseService.create(newApartmentExpenseDto, owner.id);  // Pass user ID when creating the expense
        }
      }

    }
  }

  // Manual trigger for MVP demo
  public async triggerRecurringExpensesManually(): Promise<void> {
    await this.createExpensesForCurrentMonthDemo(true);
    console.log('Recurring expenses manually triggered.');
  }

  @Cron('*/2 * * * *') // Run every 2 minutes (or adjust as needed)
  async cleanUpManualExpenses(): Promise<void> {
    await this.expenseService.deleteManualExpenses();
    console.log('Manual expenses cleaned up.');
  }
}