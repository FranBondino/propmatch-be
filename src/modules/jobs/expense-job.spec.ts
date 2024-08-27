import { TestingDB } from '../../config/testing-db'
import { ExpenseJobService } from './expense-job.service'
import { ApartmentService } from '../apartment/apartment.service'
import { ExpenseService } from '../expense/expense.service'
import { Apartment } from '../../models/renting/apartment.entity'
import { Expense } from '../../models/renting/expense.entity'
import * as moment from 'moment'
import { CarService } from '../car/car.service'
import { Car } from '../../models/renting/car.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { CarRent } from '../../models/renting/car-rent.entity'

describe('ExpenseJobService', () => {
  let expenseJobService: ExpenseJobService
  let apartmentService: ApartmentService
  let carService: CarService
  let expenseService: ExpenseService

  let apartment1: Apartment
  let apartment2: Apartment

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    const apartmentRepo = conn.getRepository(Apartment)
    const apartmentRentRepo = conn.getRepository(ApartmentRent)
    const carRentRepo = conn.getRepository(CarRent)
    const carRepo = conn.getRepository(Car)
    const expenseRepo = conn.getRepository(Expense)

    apartmentService = new ApartmentService(apartmentRepo, apartmentRentRepo)
    carService = new CarService(carRepo, carRentRepo )
    expenseService = new ExpenseService(expenseRepo, apartmentRepo, carRepo)

    apartment1 = await apartmentService.create({
      city: 'Test City 1',
      fullAddress: 'Test Address Ap 1',
    })

    apartment2 = await apartmentService.create({
      city: 'Test City 2',
      fullAddress: 'Test Address Ap 2',
    })

    const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate()
    endOfPreviousMonth.setDate(1)
    endOfPreviousMonth.setHours(0, 0, 0, 0)

    await expenseService.create({
      description: 'Test Expense 1',
      date: endOfPreviousMonth,
      cost: 500,
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })

    await expenseService.create({
      description: 'Test Expense 2',
      date: endOfPreviousMonth,
      cost: 200,
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })

    expenseJobService = new ExpenseJobService(apartmentService, expenseService, carService)
  })

  describe('createExpensesForCurrentMonth', () => {
    it('should create expenses for all apartments with previous month expenses', async () => {
      await expenseJobService.createExpensesForCurrentMonth()

      // Verify that expenses were created for the first apartment
      const expenses1 = await expenseService.findByApartmentId(apartment1.id)
      expect(expenses1.length).toBe(4)
      expect(expenses1[0].description).toBe('Test Expense 1')
      expect(expenses1[0].cost).toBe(500)
      expect(expenses1[1].description).toBe('Test Expense 2')
      expect(expenses1[1].cost).toBe(200)
      expect(expenses1[2].description).toBe('Test Expense 1')
      expect(expenses1[2].cost).toBe(500)
      expect(expenses1[3].description).toBe('Test Expense 2')
      expect(expenses1[3].cost).toBe(200)

      // Verify that no expenses were created for the second apartment
      const expenses2 = await expenseService.findByApartmentId(apartment2.id)
      expect(expenses2.length).toBe(0)
    })
  })
})