import { TestingDB } from '../../../config/testing-db'
import { v4 } from 'uuid'
import { LogService } from './log.service'
import { Log } from '../../../models/log.entity'
import { CreateLogDto } from './log.dto'
import { PaginateQueryRaw } from '../../../types/types'
import { User } from '../../../models/user.entity'
import { logCreateUser } from '../../../helpers/log.helper'
import { Repository } from 'typeorm'

describe('LogService', () => {
  let service: LogService
  let repo: Repository<Log>
  let userRepo: Repository<User>
  let logId: string

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(Log)
    userRepo = conn.getRepository(User)
    service = new LogService(repo)
  })

  describe('create', () => {
    it('should create a log', async () => {
      /**
       * Why did I create a user with the repo instead of the service?
       * We are doing unit testing, and unit tests shouldn't care about other 
       * service's business logic. Here we only care that as long as we pass an existing user
       * the log will be saved, regardless of how that user was created.
       */
      const user = await userRepo.create({
        fullName: 'a',
        email: 'a@a.com',
        password: 'test',
      }).save()

      const dto: CreateLogDto = logCreateUser(user, { id: v4() })
      const res = await service.create(dto)
      logId = res.id

      expect(res).toHaveProperty('id')
      expect(res).toHaveProperty('action')
      expect(res).toHaveProperty('resourceId')
      expect(res).toHaveProperty('resource')
      expect(res).toHaveProperty('data')
      expect(res).toHaveProperty('executingUser')
    })
  })

  describe('getAll', () => {
    it('should get all logs', async () => {
      const query: PaginateQueryRaw = {}
      const res = await service.getAll(query)

      expect(Array.isArray(res.rows)).toBe(true)
    })
  })

  describe('getById', () => {
    it('should throw an error if log with id not found', async () => {
      const id = v4()
      await expect(service.getById(id, null)).rejects.toThrow()
    })
    it('should get a log by id', async () => {
      const res = await service.getById(logId, null)
      expect(res.id).toBe(logId)
    })
  })
})