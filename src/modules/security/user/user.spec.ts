import { TestingDB } from '../../../config/testing-db'
import { v4 } from 'uuid'
import { PaginateQueryRaw } from '../../../types/types'
import { UserService } from './user.service'
import { CreateUserDto, UpdateMyProfileDto, UpdateUserDto } from './user.dto'
import { UserUtilsTestImpl } from './user-utils/user.utils-test.impl'
import { User } from '../../../models/user.entity'
import { Repository } from 'typeorm'

describe('UserService', () => {
  let service: UserService
  let repo: Repository<User>
  let user: User

  beforeAll(async () => {
    const db = TestingDB.getInstance()
    const conn = await db.initialize()

    repo = conn.getRepository(User)
    service = new UserService(repo, new UserUtilsTestImpl())
  })

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        fullName: 'full name',
        email: 'user@test.com',
        password: 'Test123456',
        type: 'admin'
      }

      const res = await service.create(dto)
      user = res

      expect(res).toHaveProperty('id')
      expect(res.fullName).toEqual(dto.fullName)
      expect(res.type).toEqual(dto.type)
    })
  })

  describe('getAll', () => {
    it('should get all users', async () => {
      const query: PaginateQueryRaw = {}
      const res = await service.getAll(query)
      expect(Array.isArray(res.rows)).toBe(true)
    })
  })

  describe('getById', () => {
    it('should throw an error if user with id was not found', async () => {
      const id = v4()
      await expect(service.getById(id, null)).rejects.toThrow()
    })

    it('should get a user by id', async () => {
      const res = await service.getById(user.id, null)
      expect(res.id).toBe(user.id)
    })
  })

  describe('getByEmail', () => {
    it('should throw an error if user with email was not found', async () => {
      await expect(service.getByEmail('fakeemail@email.com', null)).rejects.toThrow()
    })

    it('should get a user by email', async () => {
      const res = await service.getByEmail(user.email, null)
      expect(res.email).toBe(user.email)
    })
  })

  describe('getOne', () => {
    it('should throw if the user with that criteria was not found', async () => {
      await expect(service.getOne({ where: { fullName: 'asd123' } })).rejects.toThrow()
    })

    it('should get a user by criteria', async () => {
      const res = await service.getOne({ where: { fullName: user.fullName } })
      expect(res.id).toBe(user.id)
    })
  })

  describe('isEmailFree', () => {
    it('should throw an error if the user email is used by another user', async () => {
      await expect(service.isEmailFree(user.email)).rejects.toThrow()
    })
    it('should pass if the user name is used by the provided user\'s id', async () => {
      await expect(service.isEmailFree(user.email, user.id)).resolves.not.toThrow()
    })
    it('should pass if the user name it\'s free', async () => {
      const dto: CreateUserDto = {
        fullName: 'full name',
        email: 'user@test.com',
        password: 'Test123456',
        type: 'admin'
      }
      await service.create(dto)

      await expect(service.isEmailFree('emailtest@testemail.com')).resolves.not.toThrow()
    })
  })

  describe('update', () => {
    it('Should update an existing user', async () => {
      const dto: UpdateUserDto = {
        id: user.id,
        fullName: 'new-name',
        email: 'newemail@email.com',
        password: 'newpassword123'
      }

      const res = await service.update(dto)

      expect(res.id).toBe(user.id)
      expect(res.fullName).toBe(dto.fullName)
      expect(res.email).toBe(dto.email)
      expect(res).toHaveProperty('password')
    })
  })

  describe('updateMyProfile', () => {
    it('should throw an error if user with id was not found', async () => {
      const id = v4()
      const dto: UpdateMyProfileDto = {
        fullName: 'test',
        email: 'test123@test123.com'
      }

      await expect(service.updateMyProfile(id, dto)).rejects.toThrow()
    })
    it('should update the user', async () => {
      const dto: UpdateMyProfileDto = {
        fullName: 'test',
        email: 'test123@test123.com'
      }

      const res = await service.updateMyProfile(user.id, dto)

      expect(res.id).toBe(user.id)
      expect(res.fullName).toBe(dto.fullName)
      expect(res.email).toBe(dto.email)
    })
  })

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const password = 'New-password123'

      await expect(service.updatePassword(user.id, password)).resolves.not.toThrow()
    })
  })

  describe('deleteById', () => {
    it('should throw an error if the user was not found', async () => {
      await expect(service.deleteById(v4())).rejects.toThrow()
    })
    it('should throw an error if the user is the last one', async () => {
      await expect(service.deleteById(v4())).rejects.toThrow()
    })
    it('should delete the user with the given id', async () => {
      await expect(service.deleteById(user.id)).resolves.not.toThrow()
    })
  })

  describe('hashPassword', () => {
    it('should return a hashed password', async () => {
      const res = await service.hashPassword('test1234')
      expect(typeof res === 'string').toBe(true)
    })
  })
})