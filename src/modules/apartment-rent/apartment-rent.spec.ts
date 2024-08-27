import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { ApartmentRentService } from './apartment-rent.service'
import { RentPaginateQueryRaw } from '../../types/types'
import { CreateApartmentRentDto, UpdateApartmentRentDto } from './apartment-rent.dto'
import { ApartmentRent } from '../../models/renting/apartment-rent.entity'
import { ApartmentService } from '../apartment/apartment.service'
import { ClientService } from '../client/client.service'
import { Apartment } from '../../models/renting/apartment.entity'
import { Client } from '../../models/renting/client.entity'
import { Repository } from 'typeorm'

describe('ApartmentRentService', () => {
  let service: ApartmentRentService
  let repo: Repository<ApartmentRent>
  let apartmentRentId: string

  let clientService: ClientService
  let apartmentService: ApartmentService
  let clientRepo: Repository<Client>
  let apartmentRepo: Repository<Apartment>
  let apartmentRentRepo: Repository<ApartmentRent>

  let client1: Client
  let client2: Client
  let client3: Client
  let apartment1: Apartment
  let apartment2: Apartment

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(ApartmentRent)
    apartmentRepo = conn.getRepository(Apartment)
    apartmentRentRepo = conn.getRepository(ApartmentRent)
    clientRepo = conn.getRepository(Client)

    service = new ApartmentRentService(repo, apartmentRepo, clientRepo)
    apartmentService = new ApartmentService(apartmentRepo, apartmentRentRepo)
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

    apartment1 = await apartmentService.create({
      city: 'Test City 1',
      fullAddress: 'Test Address Ap 1'
    })
    apartment2 = await apartmentService.create({
      city: 'Test City 2',
      fullAddress: 'Test Address Ap 2'
    })
  })

  describe('create', () => {
    it('should create an Apartment rent', async () => {
      const testDate1: Date = new Date(10, 10, 2022)
      const testDate2: Date = new Date(10, 11, 2022)
      const testDate3: Date = new Date(11, 11, 2022)
      const testDate4: Date = new Date(12, 12, 2022)

      const dto1: CreateApartmentRentDto = {
        cost: 123,
        startedAt: testDate1,
        endedAt: testDate2,
        clientId: client1.id,
        apartmentId: apartment1.id
      }
      const dto2: CreateApartmentRentDto = {
        cost: 1234,
        startedAt: testDate3,
        endedAt: testDate4,
        clientId: client2.id,
        apartmentId: apartment2.id
      }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      apartmentRentId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.cost).toEqual(dto1.cost)
      expect(res1.startedAt).toEqual(dto1.startedAt)
      expect(res1.endedAt).toEqual(dto1.endedAt)
      expect(res1.apartment.id).toEqual(dto1.apartmentId)
      expect(res1.client.id).toEqual(dto1.clientId)

      expect(res2).toHaveProperty('id')
      expect(res2.cost).toEqual(dto2.cost)
      expect(res2.startedAt).toEqual(dto2.startedAt)
      expect(res2.endedAt).toEqual(dto2.endedAt)
      expect(res2.apartment.id).toEqual(dto2.apartmentId)
      expect(res2.client.id).toEqual(dto2.clientId)
    })
  })

  describe('getAll', () => {
    it('should get all ApartmentRents', async () => {
      const query: RentPaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all ApartmentRents by page and take', async () => {
      const query: RentPaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    describe('getById', () => {
      it('should throw an error if ApartmentRent with id not found', async () => {
        const id = v4()
        await expect(service.getById(id, null)).rejects.toThrow()
      })

      it('should get a ApartmentRent by id', async () => {
        const res = await service.getById(apartmentRentId, null)
        expect(res.id).toBe(apartmentRentId)
      })
    })

    describe('update', () => {
      it('should update an ApartmentRent', async () => {
        const startDateEdited: Date = new Date(3, 4, 2024)
        const endDateEdited: Date = new Date(5, 5, 2025)
        const costEdited = 12345

        const dto: UpdateApartmentRentDto = {
          id: apartmentRentId,
          cost: costEdited,
          endedAt: endDateEdited,
          startedAt: startDateEdited,
          clientId: client3.id
        }

        await expect(service.update(dto)).resolves.not.toThrow()
      })
    })

    describe('deleteById', () => {
      it('should delete a ApartmentRent by id', async () => {
        await expect(service.deleteById(apartmentRentId)).resolves.not.toThrow()
      })
    })
  })
})
