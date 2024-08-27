import { Client } from '../../models/renting/client.entity'
import { ApartmentService } from '../apartment/apartment.service'
import { ClientService } from '../client/client.service'
import { ApartmentRentMetricService } from './apartment-rent-metric.service'
import { Apartment } from '../../models/renting/apartment.entity'
import { TestingDB } from '../../config/testing-db'
import { ApartmentRentService } from '../apartment-rent/apartment-rent.service'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { Expense } from '../../models/renting/expense.entity'
import { ExpenseService } from '../expense/expense.service'
import { Repository } from 'typeorm'
import { Car } from '../../models/renting/car.entity'

describe('ApartmentRentService', () => {
  let service: ApartmentRentMetricService
  let clientService: ClientService
  let apartmentService: ApartmentService
  let expenseService: ExpenseService
  let apartmentRentService: ApartmentRentService

  let clientRepo: Repository<Client>
  let apartmentRepo: Repository<Apartment>
  let apartmentRentRepo: Repository<ApartmentRent>
  let carRepo: Repository<Car>
  let apartmentRentRepository: Repository<ApartmentRent>
  let expenseRepo: Repository<Expense>

  let client1: Client
  let client2: Client

  let apartment1: Apartment
  let apartment2: Apartment

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    apartmentRentRepository = conn.getRepository(ApartmentRent)
    apartmentRepo = conn.getRepository(Apartment)
    clientRepo = conn.getRepository(Client)
    expenseRepo = conn.getRepository(Expense)
    apartmentRentRepo = conn.getRepository(ApartmentRent)

    apartmentRentService = new ApartmentRentService(apartmentRentRepository, apartmentRepo, clientRepo)
    apartmentService = new ApartmentService(apartmentRepo, apartmentRentRepo)
    clientService = new ClientService(clientRepo)
    expenseService = new ExpenseService(expenseRepo, apartmentRepo, carRepo)
    service = new ApartmentRentMetricService(apartmentRentRepository, apartmentRepo, expenseRepo)

    client1 = await clientService.create({
      fullName: 'Test Name 1',
      fullAddress: 'Test Address 1',
      gender: 'male'
    })
    client2 = await clientService.create({
      fullName: 'Test Name 2',
      fullAddress: 'Test Address 2',
      gender: 'female'
    })

    apartment1 = await apartmentService.create({
      city: 'Test City 1',
      fullAddress: 'Test Address Ap 1'
    })
    apartment2 = await apartmentService.create({
      city: 'Test City 2',
      fullAddress: 'Test Address Ap 2'
    })
    await apartmentService.create({
      city: 'Test City 2',
      fullAddress: 'Test Address Ap 3'
    })

    await apartmentRentService.create({
      cost: 123,
      startedAt: new Date(2022, 1, 6),
      endedAt: new Date(2025, 10, 10),
      apartmentId: apartment1.id,
      clientId: client1.id
    })

    await apartmentRentService.create({
      cost: 1234,
      startedAt: new Date(2022, 7, 9),
      endedAt: new Date(2022, 9, 9),
      apartmentId: apartment2.id,
      clientId: client2.id
    })

    await apartmentRentService.create({
      cost: 222,
      startedAt: new Date(2023, 0, 1),
      endedAt: new Date(2023, 0, 7),
      apartmentId: apartment2.id,
      clientId: client2.id
    })

    await expenseService.create({
      cost: 123,
      date: new Date(2023, 0, 1),
      description: 'water',
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })
    await expenseService.create({
      cost: 226,
      date: new Date(2023, 1, 1),
      description: 'water',
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })

    await expenseService.create({
      cost: 122343,
      date: new Date(2023, 2, 1),
      description: 'gas',
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })

    await expenseService.create({
      cost: 122343,
      date: new Date(2023, 3, 1),
      description: 'gas',
      apartmentId: apartment1.id,
      carId: null,
      type: 'Apartment'
    })

    await expenseService.create({
      cost: 12233,
      date: new Date(),
      description: 'gas',
      apartmentId: apartment2.id,
      carId: null,
      type: 'Apartment'
    })
  })

  describe('getRevenueByYear', () => {
    it('should get total revenue by year', async () => {

      const res = await service.getTotalRevenueByYear(2022)

      expect(res).toBe(1357)
    })
  })

  describe('getRevenueByMonth', () => {
    it('should get total revenue by month', async () => {

      const res = await service.getTotalRevenueByMonth(2022, 2)

      expect(res).toBe(123)
    })
  })

  describe('getRevenueByWeek', () => {
    it('should get total revenue by week', async () => {

      const res = await service.getTotalRevenueByWeek(2023, 1)

      expect(res).toBe(222)
    })
  })

  describe('getTotalRentsByMonth', () => {
    it('should get total rents by month', async () => {

      const res = await service.getTotalRentsByMonth(2022, 2)

      expect(res).toBe(1)
    })
  })

  describe('getTotalRentsByWeek', () => {
    it('should get total rents by week', async () => {

      const res = await service.getTotalRentsByWeek(2023, 1)

      expect(res).toBe(1)
    })
  })

  describe('getApartmentOccupancyRate', () => {
    it('should get apartment occupancy rate', async () => {

      const res = await service.getApartmentOccupancyRate()

      expect(res).toBe(33.3)
    })
  })

  describe('getMonthlyApartmentOccupancyRate', () => {
    it('should get apartment occupancy rate by month', async () => {

      const res = await service.getMonthlyApartmentOccupancyRate(2022, 2)

      expect(res).toBe(33.3)
    })
  })

  describe('getAverageDurationOfRentals', () => {
    it('should get average duration time of rentals', async () => {

      const res = await service.getAverageDurationOfRentalsByMonth(2022, 2)
      expect(res).toBe(1373)
    })
  })
/*
  describe('getPercentageOfApartmentsRentedByGender', () => {
    it('should get the percentage of apartments rented by either gender', async () => {

      const res = await service.getPercentageOfApartmentsRentedByGender()
      console.log(res)
      expect(res[0].percentage).toBe(33.3)
      expect(res[1].percentage).toBe(66.7)
    })
  })
*/
  describe('getPopularRentalMonths', () => {
    it('should get the most popular rental months within a given limit', async () => {

      const res = await service.getPopularRentalMonths(2022, 2)

      expect(res[0].frequency).toBe(1)
      expect(res[1].frequency).toBe(1)
    })
  })

  describe('getTopRentedApartments', () => {
    it('should get the top rented apartments', async () => {

      const res = await service.getTopRentedApartments()

      expect(res[0].address).toBe('Test Address Ap 2')
      expect(res[1].address).toBe('Test Address Ap 1')
    })
  })

  describe('getTopRentedApartmentsByMonth', () => {
    it('should get the top rented apartments by month', async () => {

      const res = await service.getTopRentedApartmentsByMonth(2, 2022)

      expect(res[0].address).toBe('Test Address Ap 1')
    })
  })

  describe('getAverageRentByCity', () => {
    it('should get the average rent cost by city', async () => {

      const res = await service.getAverageRentByCity()
      expect(res.length).toBe(2)
      expect(res[0].averageRent).toBe(123)
      expect(res[1].averageRent).toBe(728)
    })
  })

  describe('getAverageExpenseCostByType', () => {
    it('should get the expense cost by type', async () => {

      const res = await service.getAverageExpenseCostByDescription()
      expect(res[0].averageCost).toBe(174.5)
      expect(res[1].averageCost).toBe(85639.7)
    })
  })

  describe('getMostExpensiveExpenses', () => {
    it('should get the most expensive expenses', async () => {

      const res = await service.getMostExpensiveExpenses(2)
      expect(res.length).toBe(2)
      expect(res[0].cost).toBe(122343)
    })
  })

  describe('getExpensCostAugmentRate', () => {
    it('should get the rate at which expenses augment', async () => {

      const res = await service.getExpenseCostAugmentRate()
      expect(res.length).toBe(2)
      expect(res[1].augmentRate).toBe(0)
    })
  })
})