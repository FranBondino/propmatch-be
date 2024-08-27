import { Client } from '../../models/renting/client.entity'
import { CarService } from '../car/car.service'
import { ClientService } from '../client/client.service'
import { CarRentMetricService } from './car-rent-metric.service'
import { Car } from '../../models/renting/car.entity'
import { TestingDB } from '../../config/testing-db'
import { CarRentService } from '../car-rent/car-rent.service'
import { CarRent } from '../../models/renting/car-rent.entity'
import { Repository } from 'typeorm'
import { Expense } from '../../models/renting/expense.entity'

describe('CarRentService', () => {
  let service: CarRentMetricService
  let clientService: ClientService
  let carService: CarService
  let carRentService: CarRentService

  let clientRepo: Repository<Client>
  let carRepo: Repository<Car>
  let carRentRepository: Repository<CarRent>
  let expenseRepo: Repository<Expense>

  let client1: Client
  let client2: Client

  let car1: Car
  let car2: Car

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    carRentRepository = conn.getRepository(CarRent)
    carRepo = conn.getRepository(Car)
    clientRepo = conn.getRepository(Client)
    expenseRepo = conn.getRepository(Expense)

    carRentService = new CarRentService(carRentRepository, carRepo, clientRepo)
    carService = new CarService(carRepo, carRentRepository)
    clientService = new ClientService(clientRepo)
    service = new CarRentMetricService(carRentRepository, carRepo, expenseRepo)

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

    car1 = await carService.create({
      make: 'Honda',
      model: 'Neo',
      color: 'red',
      yearOfManufacturing: 2011
    })
    car2 = await carService.create({
      make: 'Toyota',
      model: 'Corolla',
      color: 'black',
      yearOfManufacturing: 2011
    })
    await carService.create({
      make: 'Toyota',
      model: 'Corolla',
      color: 'white',
      yearOfManufacturing: 2014
    })

    await carRentService.create({
      cost: 123,
      startedAt: new Date(2022, 1, 6),
      endedAt: new Date(2027, 10, 10),
      carId: car1.id,
      clientId: client1.id
    })

    await carRentService.create({
      cost: 1234,
      startedAt: new Date(2022, 7, 9),
      endedAt: new Date(2022, 9, 9),
      carId: car2.id,
      clientId: client2.id
    })

    await carRentService.create({
      cost: 222,
      startedAt: new Date(2023, 0, 1),
      endedAt: new Date(2023, 0, 7),
      carId: car2.id,
      clientId: client2.id
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

  describe('getCarOccupancyRate', () => {
    it('should get car occupancy rate', async () => {

      const res = await service.getCarOccupancyRate()

      expect(res).toBe(33.3)
    })
  })

  describe('getMonthlyCarOccupancyRate', () => {
    it('should get car occupancy rate by month', async () => {

      const res = await service.getMonthlyCarOccupancyRate(2022, 2)

      expect(res).toBe(33.3)
    })
  })
/*
  describe('getAverageDurationOfRentals', () => {
    it('should get average duration time of rentals', async () => {

      const res = await service.getAverageDurationOfRentalsByMonth()

      expect(res).toBe(723.3)
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

  describe('getTopRentedCars', () => {
    it('should get the top rented cars', async () => {

      const res = await service.getTopRentedCars()

      expect(res[0].model).toBe('Corolla')
      expect(res[1].model).toBe('Neo')
    })
  })
})