import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { GetAllPaginatedQB } from '../../../helpers/pagination.helper'
import { Paginated, PaginateQueryRaw } from '../../../types/types'
import { CreateUserDto, UpdateMyProfileDto, UpdateUserDto } from './user.dto'
import { errorsCatalogs } from '../../../catalogs/errors-catalogs'
import { IUserUtils } from './user.interface'
import { USER_UTILS } from './user-utils/user.utils'
import { User } from '../../../models/user.entity'
import { InjectRepository } from '@nestjs/typeorm'

const {
  USER_NOT_FOUND,
  USER_EMAIL_NOT_FOUND,
  USER_EMAIL_TAKEN
} = errorsCatalogs

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @Inject(USER_UTILS)
    private readonly userUtils: IUserUtils
  ) { }

  public async getById(id: string, options: FindOptionsWhere<User>): Promise<User> {
    const obj = await this.repository.findOne(({
      where: { id },
      ...options,
    }))
    if (!obj) throw new NotFoundException(USER_NOT_FOUND)
    return obj
  }

  public async getOne(options: FindOneOptions<User>): Promise<User> {
    const obj = await this.repository.findOne(options)
    if (!obj) throw new NotFoundException(USER_NOT_FOUND)
    return obj
  }

  public async getByEmail(email: string, options: FindOptionsWhere<User>): Promise<User> {
    const obj = await this.repository.findOne({ where: { email }, ...options })
    if (!obj) throw new NotFoundException(USER_EMAIL_NOT_FOUND)
    return obj
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<User>> {
    const qb = this.repository.createQueryBuilder('user')

    if (query.search) {
      qb.andWhere(`LOWER(user.fullName) Like '%${query.search.toLowerCase()}%'`)
    }

    return GetAllPaginatedQB(qb, query)
  }

  public async findPotentialRoommates(currentUser: User): Promise<User[]> {
    const {
      preferredCity,
      maxBudget,
      smoking,
      pets,
      noiseTolerance,
      preferredLanguage,
      genderPreference,
      gender
    } = currentUser.preferences || {};
  
    return this.repository.createQueryBuilder('user')
      .where('user.type = :type', { type: 'user' })
      .andWhere('user.preferences ->> \'preferredCity\' = :city', { city: preferredCity })
      .andWhere('user.preferences ->> \'maxBudget\'::float >= :budget', { budget: maxBudget })
      .andWhere('user.preferences ->> \'smoking\'::boolean = :smoking', { smoking })
      .andWhere('user.preferences ->> \'pets\'::boolean = :pets', { pets })
      .andWhere('user.preferences ->> \'noiseTolerance\'::float >= :noiseTolerance', { noiseTolerance })
      .andWhere('user.preferences ->> \'preferredLanguage\' = :language', { language: preferredLanguage })
      .andWhere('user.preferences ->> \'gender\' = :gender', { gender: genderPreference })
      .andWhere('user.id != :id', { id: currentUser.id }) // Exclude current user
      .getMany();
  }

  public async create(dto: CreateUserDto): Promise<User> {
    dto.password = await this.userUtils.hashPassword(dto.password)
    const obj = this.repository.create(dto)

    return obj.save()
  }

  public async signup(dto: CreateUserDto): Promise<User> {
    // Check if the email is already taken
    await this.isEmailFree(dto.email);
  
    // Hash the user's password
    dto.password = await this.userUtils.hashPassword(dto.password);
  
    // Create the user entity
    const newUser = this.repository.create(dto);
  
    // Save the new user to the database
    const savedUser = await this.repository.save(newUser);
  
    // Remove sensitive information before returning the user
    delete savedUser.password;
  
    return savedUser
  }

  public async update(dto: UpdateUserDto): Promise<User> {
    await this.getById(dto.id, null)
    if (dto.password) {
      dto.password = await this.userUtils.hashPassword(dto.password)
    }

    return this.repository.save(dto)
  }

  public async updateMyProfile(id: string, dto: UpdateMyProfileDto): Promise<User> {
    const res = await this.repository.update(id, dto)
    if (res.affected === 0) throw new NotFoundException(USER_NOT_FOUND)

    return this.getById(id, null)
  }

  public async deleteById(id: string): Promise<void> {
    const result = await this.repository.softDelete(id)
    if (result.affected === 0) throw new NotFoundException(USER_NOT_FOUND)
  }

  public async hashPassword(value: string): Promise<string> {
    return this.userUtils.hashPassword(value)
  }

  public async isEmailFree(email: string, userId?: string): Promise<void> {
    const queryOptions: FindOneOptions<User> = { where: { email } }
    const foundObj = await this.repository.findOne(queryOptions)
    if (foundObj && foundObj.id !== userId) {
      throw new BadRequestException(USER_EMAIL_TAKEN)
    }
  }

  public async updatePassword(userId: string, password: string): Promise<void> {
    const user = await this.getById(userId, null)
    user.password = await this.userUtils.hashPassword(password)
    await user.save()
  }
}
