import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { ClientService } from './client.service'
import { Client } from '../../models/renting/client.entity'
import { CreateClientDto, UpdateClientDto } from './client.dto'
import { PaginateQueryRaw } from '../../types/types'
import { Repository } from 'typeorm'

describe('ClientService', () => {
  let service: ClientService
  let repo: Repository<Client>
  let clientId: string

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(Client)
    service = new ClientService(repo)
  })

  describe('create', () => {
    it('should create a Client', async () => {
      const dto1: CreateClientDto = {
        fullName: 'Name1',
        fullAddress: 'Address 1',
        phoneNumber: '123456',
        gender: 'male',
        email: 'asdas@hotmail.com'
      }
      const dto2: CreateClientDto = {
        fullName: 'Name2',
        fullAddress: 'Address 2',
        phoneNumber: '1234567',
        gender: 'female',
        email: 'asdasdfs@hotmail.com'
      }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      clientId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.fullName).toEqual(dto1.fullName)
      expect(res1.fullAddress).toEqual(dto1.fullAddress)
      expect(res1.phoneNumber).toEqual(dto1.phoneNumber)
      expect(res1.gender).toEqual(dto1.gender)
      expect(res1.email).toEqual(dto1.email)

      expect(res2).toHaveProperty('id')
      expect(res2.fullName).toEqual(dto2.fullName)
      expect(res2.fullAddress).toEqual(res2.fullAddress)
      expect(res2.phoneNumber).toEqual(res2.phoneNumber)
      expect(res2.gender).toEqual(res2.gender)
      expect(res2.email).toEqual(res2.email)
    })
  })

  describe('getAll', () => {
    it('should get all Clients', async () => {
      const query: PaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all Clients by page and take', async () => {
      const query: PaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    it('should get all Clients by search string by name', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'Name1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].fullName).toBe(query.search)
    })

    it('should get all Clients by search string by address', async () => {
      const query: PaginateQueryRaw = { page: '1', search: 'Address 1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
      expect(res.rows[0].fullAddress).toBe(query.search)
    })
  })

  describe('getById', () => {
    it('should throw an error if Client with id not found', async () => {
      const id = v4()
      await expect(service.getById(id, null)).rejects.toThrow()
    })

    it('should get a Client by id', async () => {
      const res = await service.getById(clientId, null)
      expect(res.id).toBe(clientId)
    })
  })

  describe('update', () => {
    it('should update a Client', async () => {
      const fullName = 'NameEdited'
      const fullAddress = 'Address Edited'
      const dto: UpdateClientDto = { id: clientId, fullName, fullAddress }

      await expect(service.update(dto)).resolves.not.toThrow()
    })
  })

  describe('deleteById', () => {
    it('should delete a Client by id', async () => {
      await expect(service.deleteById(clientId)).resolves.not.toThrow()
    })
  })
})