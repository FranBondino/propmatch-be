import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { CarRentService } from './car-rent.service'
import { RentPaginateQueryRaw } from '../../types/types'
import { CreateCarRentDto, UpdateCarRentDto } from './car-rent.dto'
import { CarRent } from '../../models/renting/car-rent.entity'
import { CarService } from '../car/car.service'
import { ClientService } from '../client/client.service'
import { Car } from '../../models/renting/car.entity'
import { Client } from '../../models/renting/client.entity'
import { Repository } from 'typeorm'

describe('CarRentService', () => {
  let service: CarRentService
  let repo: Repository<CarRent>
  let carRentId: string

  let clientService: ClientService
  let carService: CarService
  let clientRepo: Repository<Client>
  let carRepo: Repository<Car>

  let client1: Client
  let client2: Client
  let client3: Client
  let car1: Car
  let car2: Car

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(CarRent)
    carRepo = conn.getRepository(Car)
    clientRepo = conn.getRepository(Client)

    service = new CarRentService(repo, carRepo, clientRepo)
    carService = new CarService(carRepo, repo)
    clientService = new ClientService(clientRepo)

    client1 = await clientService.create({
      fullName: 'Test Name 1',
      fullAddress: 'Test Address 1'
    })
    client2 = await clientService.create({
      fullName: 'Test Name 2',
      fullAddress: 'Test Address 2'
    })
    client3 = await clientService.create({
      fullName: 'Test Name 3',
      fullAddress: 'Test Address 3'
    })

    car1 = await carService.create({
      make: 'Test Make 1',
      model: 'Test Model 1',
      color: 'red',
      yearOfManufacturing: 2021
    })
    car2 = await carService.create({
      make: 'Test Make 2',
      model: 'Test Model 2',
      color: 'red',
      yearOfManufacturing: 2021
    })
  })

  describe('create', () => {
    it('should create an Car rent', async () => {
      const testDate1: Date = new Date(10, 10, 2022)
      const testDate2: Date = new Date(10, 11, 2022)
      const testDate3: Date = new Date(11, 11, 2022)
      const testDate4: Date = new Date(12, 12, 2022)

      const dto1: CreateCarRentDto = {
        cost: 123,
        startedAt: testDate1,
        endedAt: testDate2,
        clientId: client1.id,
        carId: car1.id
      }
      const dto2: CreateCarRentDto = {
        cost: 1234,
        startedAt: testDate3,
        endedAt: testDate4,
        clientId: client2.id,
        carId: car2.id
      }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      carRentId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.cost).toEqual(dto1.cost)
      expect(res1.startedAt).toEqual(dto1.startedAt)
      expect(res1.endedAt).toEqual(dto1.endedAt)
      expect(res1.car.id).toEqual(dto1.carId)
      expect(res1.client.id).toEqual(dto1.clientId)

      expect(res2).toHaveProperty('id')
      expect(res2.cost).toEqual(dto2.cost)
      expect(res2.startedAt).toEqual(dto2.startedAt)
      expect(res2.endedAt).toEqual(dto2.endedAt)
      expect(res2.car.id).toEqual(dto2.carId)
      expect(res2.client.id).toEqual(dto2.clientId)
    })
  })

  describe('getAll', () => {
    it('should get all CarRents', async () => {
      const query: RentPaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all CarRents by page and take', async () => {
      const query: RentPaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    describe('getById', () => {
      it('should throw an error if CarRent with id not found', async () => {
        const id = v4()
        await expect(service.getById(id, null)).rejects.toThrow()
      })

      it('should get a CarRent by id', async () => {
        const res = await service.getById(carRentId, null)
        expect(res.id).toBe(carRentId)
      })
    })

    describe('update', () => {
      it('should update an CarRent', async () => {
        const startDateEdited: Date = new Date(3, 4, 2024)
        const endDateEdited: Date = new Date(5, 5, 2025)
        const costEdited = 12345

        const dto: UpdateCarRentDto = {
          id: carRentId,
          cost: costEdited,
          endedAt: endDateEdited,
          startedAt: startDateEdited,
          clientId: client3.id
        }

        await expect(service.update(dto)).resolves.not.toThrow()
      })
    })

    describe('deleteById', () => {
      it('should delete a CarRent by id', async () => {
        await expect(service.deleteById(carRentId)).resolves.not.toThrow()
      })
    })
  })
})
