import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { CarService } from './car.service'
import { Car } from '../../models/renting/car.entity'
import { CreateCarDto, UpdateCarDto } from './car.dto'
import { PaginateQueryRaw } from '../../types/types'
import { Repository } from 'typeorm'
import { CarRent } from '../../models/renting/car-rent.entity'

describe('CarService', () => {
  let service: CarService
  let repo: Repository<Car>
  let carRentRepo: Repository<CarRent>
  let carId: string

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(Car)
    service = new CarService(repo, carRentRepo)
  })

  describe('create', () => {
    it('should create a Car', async () => {
      const dto1: CreateCarDto = {
        make: 'Test Make 1',
        model: 'Test Model 1',
        color: 'red',
        yearOfManufacturing: 2020
      }
      const dto2: CreateCarDto = {
        make: 'Test Make 2',
        model: 'Test Model 2',
        color: 'black',
        yearOfManufacturing: 2015
      }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      carId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.make).toEqual(dto1.make)
      expect(res1.model).toEqual(dto1.model)
      expect(res1.color).toEqual(dto1.color)
      expect(res1.yearOfManufacturing).toEqual(dto1.yearOfManufacturing)

      expect(res2).toHaveProperty('id')
      expect(res2.make).toEqual(dto2.make)
      expect(res2.model).toEqual(res2.model)
      expect(res2.color).toEqual(dto2.color)
      expect(res2.yearOfManufacturing).toEqual(dto2.yearOfManufacturing)
    })
  })

  describe('getAll', () => {
    it('should get all Cars', async () => {
      const query: PaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all Cars by page and take', async () => {
      const query: PaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    it('should get all Cars by search string by make', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'Test Make 1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].make).toBe(query.search)
    })

    it('should get all Cars by search string by model', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'Test Model 1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].model).toBe(query.search)
    })
  })

  describe('getById', () => {
    it('should throw an error if Car with id not found', async () => {
      const id = v4()
      await expect(service.getById(id, null)).rejects.toThrow()
    })

    it('should get a Car by id', async () => {
      const res = await service.getById(carId, null)
      expect(res.id).toBe(carId)
    })
  })

  describe('update', () => {
    it('should update a Car', async () => {
      const make = 'Make Edited'
      const model = 'Model Edited'
      const dto: UpdateCarDto = { id: carId, make, model }

      await expect(service.update(dto)).resolves.not.toThrow()
    })
  })

  describe('deleteById', () => {
    it('should delete a Car by id', async () => {
      await expect(service.deleteById(carId)).resolves.not.toThrow()
    })
  })
})
