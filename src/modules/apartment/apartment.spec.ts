import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { ApartmentService } from './apartment.service'
import { Apartment } from '../../models/renting/apartment.entity'
import { CreateApartmentDto, UpdateApartmentDto } from './apartment.dto'
import { PaginateQueryRaw } from '../../types/types'
import { Repository } from 'typeorm'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'

describe('ApartmentService', () => {
  let service: ApartmentService
  let repo: Repository<Apartment>
  let apartmentRentRepo: Repository<ApartmentRent>
  let apartmentId: string

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(Apartment)
    apartmentRentRepo = conn.getRepository(ApartmentRent)
    service = new ApartmentService(repo, apartmentRentRepo)
  })

  describe('create', () => {
    it('should create a Apartment', async () => {
      const dto1: CreateApartmentDto = { city: 'City1', fullAddress: 'Test Address 1' }
      const dto2: CreateApartmentDto = { city: 'City2', fullAddress: 'Test Address 2' }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      apartmentId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.city).toEqual(dto1.city)
      expect(res1.fullAddress).toEqual(dto1.fullAddress)

      expect(res2).toHaveProperty('id')
      expect(res2.city).toEqual(dto2.city)
      expect(res2.fullAddress).toEqual(res2.fullAddress)
    })
  })

  describe('getAll', () => {
    it('should get all Apartments', async () => {
      const query: PaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all Apartments by page and take', async () => {
      const query: PaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    it('should get all Apartments by search string by city', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'City1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].city).toBe(query.search)
    })

    it('should get all Apartments by search string by address', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'Test Address 1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].fullAddress).toBe(query.search)
    })

  })

  describe('getById', () => {
    it('should throw an error if Apartment with id not found', async () => {
      const id = v4()
      await expect(service.getById(id, null)).rejects.toThrow()
    })

    it('should get a Apartment by id', async () => {
      const res = await service.getById(apartmentId, null)
      expect(res.id).toBe(apartmentId)
    })
  })

  describe('update', () => {
    it('should update a Apartment', async () => {
      const city = 'CityEdited'
      const fullAddress = 'Address Edited'
      const dto: UpdateApartmentDto = { id: apartmentId, city, fullAddress }

      await expect(service.update(dto)).resolves.not.toThrow()
    })
  })

  describe('deleteById', () => {
    it('should delete a Apartment by id', async () => {
      await expect(service.deleteById(apartmentId)).resolves.not.toThrow()
    })
  })
})