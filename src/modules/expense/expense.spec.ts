import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { PaginateQueryRaw } from '../../types/types'
import { ExpenseService } from './expense.service'
import { CreateExpenseDto, UpdateExpenseDto } from './expense.dto'
import { Expense } from '../../models/renting/expense.entity'
import { ApartmentService } from '../apartment/apartment.service'
import { Apartment } from '../../models/renting/apartment.entity'
import * as moment from 'moment'
import { Repository } from 'typeorm'
import { Car } from '../../models/renting/car.entity'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'

describe('ExpenseService', () => {
  let service: ExpenseService
  let repo: Repository<Expense>
  let expenseId: string

  let apartmentService: ApartmentService
  let apartmentRepo: Repository<Apartment>
  let apartmentRentRepo: Repository<ApartmentRent>

  let carRepo: Repository<Car>

  let apartment1: Apartment
  let apartment2: Apartment
  let apartment3: Apartment

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(Expense)
    apartmentRepo = conn.getRepository(Apartment)
    apartmentRentRepo = conn.getRepository(ApartmentRent)
    carRepo = conn.getRepository(Car)

    service = new ExpenseService(repo, apartmentRepo, carRepo)
    apartmentService = new ApartmentService(apartmentRepo, apartmentRentRepo)

    apartment1 = await apartmentService.create({
      city: 'Test City 1',
      fullAddress: 'Test Address Ap 1'
    })
    apartment2 = await apartmentService.create({
      city: 'Test City 2',
      fullAddress: 'Test Address Ap 2'
    })
    apartment3 = await apartmentService.create({
      city: 'Test City 3',
      fullAddress: 'Test Address Ap 3'
    })
  })

  describe('create', () => {
    it('should create an Apartment expense', async () => {
      const testDate1: Date = new Date(10, 10, 2022)
      const testDate2: Date = new Date(10, 11, 2022)

      const dto1: CreateExpenseDto = {
        cost: 123,
        date: testDate1,
        description: 'Test Expense 1',
        apartmentId: apartment1.id,
        carId: null,
        type: 'Apartment'
      }
      const dto2: CreateExpenseDto = {
        cost: 1234,
        date: testDate2,
        description: 'Test Expense 2',
        apartmentId: apartment2.id,
        carId: null,
        type: 'Apartment'
      }
      
      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      expenseId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.cost).toEqual(dto1.cost)
      expect(res1.date).toEqual(dto1.date)
      expect(res1.description).toEqual(dto1.description)
      expect(res1.apartment.id).toEqual(dto1.apartmentId)

      expect(res2).toHaveProperty('id')
      expect(res2.cost).toEqual(dto2.cost)
      expect(res2.date).toEqual(dto2.date)
      expect(res2.description).toEqual(dto2.description)
      expect(res2.apartment.id).toEqual(dto2.apartmentId)
    })
  })

  describe('getAll', () => {
    it('should get all Expenses', async () => {
      const query: PaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all Expenses by page and take', async () => {
      const query: PaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    describe('getById', () => {
      it('should throw an error if Expense with id not found', async () => {
        const id = v4()
        await expect(service.getById(id, null)).rejects.toThrow()
      })


      it('should get a Expense by id', async () => {
        const res = await service.getById(expenseId, null)
        expect(res.id).toBe(expenseId)
      })
    })

    describe('getPreviousMonthApartmentExpenses', () => {
      it('should return all expenses from the previous month', async () => {
        // Create expenses in the previous month
        const endOfPreviousMonth = moment().subtract(1, 'month').endOf('month').toDate()
        endOfPreviousMonth.setDate(1)
        endOfPreviousMonth.setHours(0, 0, 0, 0)

        const expense1 = await service.create({
          description: 'Test Expense 1',
          date: endOfPreviousMonth,
          cost: 500,
          apartmentId: apartment1.id,
          carId: null,
          type: 'Apartment'
        })

        const expense2 = await service.create({
          description: 'Test Expense 2',
          date: endOfPreviousMonth,
          cost: 200,
          apartmentId: apartment1.id,
          carId: null,
          type: 'Apartment'
        })

        // Call the getPreviousMonthExpense method
        const prevMonthExpenses = await service.getPreviousMonthApartmentExpenses(apartment1.id)

        // Check that the method returns all the expenses from the previous month
        expect(prevMonthExpenses).toHaveLength(2)
        expect(prevMonthExpenses[0].id).toBe(expense1.id)
        expect(prevMonthExpenses[1].id).toBe(expense2.id)
      })
    })

    describe('getExpensesByMonth', () => {
      it('should return expenses for the specified month and apartment', async () => {
        // Create expenses for the specified month and apartment
        const year = 2023
        const month = 9 // September (1 for January, 2 for February, and so on)

        // Create expenses for September 2023 for apartment1
        await service.create({
          description: 'Expense for September',
          date: new Date(year, month - 1, 5), // Date in September 2023
          cost: 100,
          apartmentId: apartment1.id,
          carId: null,
          type: 'Apartment'
        })

        await service.create({
          description: 'Another Expense for September',
          date: new Date(year, month - 1, 15), // Date in September 2023
          cost: 200,
          apartmentId: apartment1.id,
          carId: null,
          type: 'Apartment'
        })

        // Call the getExpensesByMonth method for apartment1 and September 2023
        const expenses = await service.getExpensesByMonthforApartment(apartment1.id, year, month)

        // Check that the method returns expenses for apartment1 and September 2023
        expect(expenses).toHaveLength(2)
      })

      it('should return an empty array if no expenses are found for the specified month and apartment', async () => {
        // Create expenses for a different month and apartment
        const year = 2023

        // Call the getExpensesByMonth method for apartment1 and March 2023 which has no loaded expenses
        const expenses = await service.getExpensesByMonthforApartment(apartment1.id, year, 3)

        // Check that the method returns an empty array
        expect(expenses).toHaveLength(0)
      })
    })

    describe('update', () => {
      it('should update an Expense', async () => {
        const dateEdited: Date = new Date(3, 4, 2024)
        const costEdited = 12345
        const descriptionEdited = 'Test Expense Edited'

        const dto: UpdateExpenseDto = {
          id: expenseId,
          cost: costEdited,
          date: dateEdited,
          description: descriptionEdited,
          apartmentId: apartment3.id
        }

        await expect(service.update(dto)).resolves.not.toThrow()
      })
    })

    describe('deleteById', () => {
      it('should delete a Expense by id', async () => {
        await expect(service.deleteById(expenseId)).resolves.not.toThrow()
      })
    })
  })
})