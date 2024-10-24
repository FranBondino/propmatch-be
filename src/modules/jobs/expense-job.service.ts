import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ExpenseService } from '../expense/expense.service'
import { ApartmentService } from '../apartment/apartment.service'
import { CreateExpenseDto } from '../expense/expense.dto'
import { CarService } from '../car/car.service'

@Injectable()
export class ExpenseJobService {
  constructor(
    private readonly apartmentService: ApartmentService,
    private readonly expenseService: ExpenseService,
    private readonly carService: CarService,
  ) { }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async createExpensesForCurrentMonth(): Promise<void> {
    const apartments = await this.apartmentService.findAll()
    const cars = await this.carService.findAll()

    for (const apartment of apartments) {
      const previousMonthExpenses = await this.expenseService.getPreviousMonthApartmentExpenses(
        apartment.id,
      )

      for (const expense of previousMonthExpenses) {
        const NewApartmentExpenseDto: CreateExpenseDto = {
          apartmentId: apartment.id,
          date: new Date(),
          cost: expense.cost,
          description: expense.description,
          carId: null,
          type: 'Apartment'
        }

        await this.expenseService.create(NewApartmentExpenseDto)
      }
    }

    for (const car of cars) {
      const carPreviousMonthExpenses = await this.expenseService.getPreviousMonthCarExpenses(
        car.id,
      )

      for (const expense of carPreviousMonthExpenses) {
        const newCarExpenseDto: CreateExpenseDto = {
          carId: car.id,
          date: new Date(),
          cost: expense.cost,
          description: expense.description,
          apartmentId: null,
          type: 'Car',
        }

        await this.expenseService.create(newCarExpenseDto)
      }
    }
  }
  /*
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async createExpensesForCurrentMonth(): Promise<void> {
    // Get all users (owners)
    const users = await this.expenseService.getAllOwners();

    for (const user of users) {
      // Fetch apartments and cars for the current user
      const apartments = await this.apartmentService.findByOwnerId(user.id);
      const cars = await this.carService.findByOwnerId(user.id);

      // Create expenses for apartments
      for (const apartment of apartments) {
        const previousMonthExpenses = await this.expenseService.getPreviousMonthApartmentExpenses(user.id, apartment.id);

        for (const expense of previousMonthExpenses) {
          const newApartmentExpenseDto: CreateExpenseDto = {
            apartmentId: apartment.id,
            date: new Date(),
            cost: expense.cost,
            description: expense.description,
            carId: null,
            type: 'Apartment',
          };

          await this.expenseService.create(newApartmentExpenseDto, user.id);  // Pass user ID when creating the expense
        }
      }

      // Create expenses for cars
      for (const car of cars) {
        const carPreviousMonthExpenses = await this.expenseService.getPreviousMonthCarExpenses(user.id, car.id);

        for (const expense of carPreviousMonthExpenses) {
          const newCarExpenseDto: CreateExpenseDto = {
            carId: car.id,
            date: new Date(),
            cost: expense.cost,
            description: expense.description,
            apartmentId: null,
            type: 'Car',
          };

          await this.expenseService.create(newCarExpenseDto, user.id);  // Pass user ID when creating the expense
        }
      }
    }
  }

  */
}