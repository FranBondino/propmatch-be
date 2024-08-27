import { v4 } from 'uuid'
import { TestingDB } from '../../config/testing-db'
import { PaginateQueryRaw } from '../../types/types'
import { AgencyProcedureService } from './agency-procedure.service'
import { CreateAgencyProcedureDto, UpdateAgencyProcedureDto } from './agency-procedure.dto'
import { AgencyProcedure } from '../../models/agency-procedure.entity'
import { ClientService } from '../client/client.service'
import { Client } from '../../models/renting/client.entity'
import { Repository } from 'typeorm'

describe('AgencyProcedureService', () => {
  let service: AgencyProcedureService
  let repo: Repository<AgencyProcedure>
  let agencyProcedureId: string

  let clientService: ClientService
  let clientRepo: Repository<Client>

  let client1: Client
  let client2: Client
  let client3: Client

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(AgencyProcedure)
    clientRepo = conn.getRepository(Client)

    service = new AgencyProcedureService(repo, clientRepo)
    clientService = new ClientService(clientRepo)

    client1 = await clientService.create({
      fullName: 'Client A',
      fullAddress: 'Test Address Ap 1'
    })
    client2 = await clientService.create({
      fullName: 'Client B',
      fullAddress: 'Test Address Ap 2'
    })
    client3 = await clientService.create({
      fullName: 'Clien C',
      fullAddress: 'Test Address Ap 3'
    })
  })

  describe('create', () => {
    it('should create an Client rent', async () => {
      const testDate1: Date = new Date(10, 10, 2022)
      const testDate2: Date = new Date(10, 11, 2022)

      const dto1: CreateAgencyProcedureDto = {
        cost: 123,
        date: testDate1,
        description: 'Test AgencyProcedure 1',
        clientId: client1.id
      }
      const dto2: CreateAgencyProcedureDto = {
        cost: 1234,
        date: testDate2,
        description: 'Test AgencyProcedure 2',
        clientId: client2.id
      }

      const res1 = await service.create(dto1)
      const res2 = await service.create(dto2)

      agencyProcedureId = res1.id

      expect(res1).toHaveProperty('id')
      expect(res1.cost).toEqual(dto1.cost)
      expect(res1.date).toEqual(dto1.date)
      expect(res1.description).toEqual(dto1.description)
      expect(res1.clientId).toEqual(dto1.clientId)

      expect(res2).toHaveProperty('id')
      expect(res2.cost).toEqual(dto2.cost)
      expect(res2.date).toEqual(dto2.date)
      expect(res2.description).toEqual(dto2.description)
      expect(res2.clientId).toEqual(dto2.clientId)
    })
  })

  describe('getAll', () => {
    it('should get all AgencyProcedures', async () => {
      const query: PaginateQueryRaw = { page: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(2)
    })

    it('should get all AgencyProcedures by page and take', async () => {
      const query: PaginateQueryRaw = { page: '1', take: '1' }

      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
      expect(res.rows.length).toBe(1)
    })

    describe('getById', () => {
      it('should throw an error if AgencyProcedure with id not found', async () => {
        const id = v4()
        await expect(service.getById(id, null)).rejects.toThrow()
      })

      it('should get a AgencyProcedure by id', async () => {
        const res = await service.getById(agencyProcedureId, null)
        expect(res.id).toBe(agencyProcedureId)
      })
    })

    describe('update', () => {
      it('should update an AgencyProcedure', async () => {
        const dateEdited: Date = new Date(3, 4, 2024)
        const costEdited = 12345
        const descriptionEdited = 'Test AgencyProcedure Edited'


        const dto: UpdateAgencyProcedureDto = {
          id: agencyProcedureId,
          cost: costEdited,
          date: dateEdited,
          description: descriptionEdited,
          clientId: client3.id
        }

        await expect(service.update(dto)).resolves.not.toThrow()
      })
    })

    describe('deleteById', () => {
      it('should delete a AgencyProcedure by id', async () => {
        await expect(service.deleteById(agencyProcedureId)).resolves.not.toThrow()
      })
    })
  })
})
