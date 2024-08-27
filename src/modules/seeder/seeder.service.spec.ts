import { User } from '../../models/user.entity'
import { TestingDB } from '../../config/testing-db'
import { UserUtilsTestImpl } from '../security/user/user-utils/user.utils-test.impl'
import { UserService } from '../security/user/user.service'
import { SeederService } from './seeder.service'

describe('SeederService', () => {
  let service: SeederService
  const env = 'PROD'
  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    const userRepo = conn.getRepository(User)

    const userService = new UserService(userRepo, new UserUtilsTestImpl())

    service = new SeederService(
      userService,
      userRepo,
    )
  })

  describe('seed', () => {
    it('should seed the db', async () => {
      await expect(service.seed(env)).resolves.not.toThrow()
    })
    it('should skip the seed if there is at least a user on the db', async () => {
      await expect(service.seed(env)).resolves.toBeUndefined()
    })
  })
})