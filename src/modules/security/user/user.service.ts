import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { GetAllPaginatedQB } from '../../../helpers/pagination.helper'
import { Paginated, PaginateQueryRaw, UserPreferences } from '../../../types/types'
import { CreateUserDto, UpdateMyProfileDto, UpdateUserDto, UserPreferencesDto } from './user.dto'
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

  /*
  public async setPreferences(currentUser: User, dto: UserPreferencesDto): Promise<User> {
    // 1. Validate the input preferences
    const {
      preferredCity,
      maxBudget,
      smoking,
      pets,
      preferredLanguage,
      genderPreference,
    } = dto;

    // Validation checks (you can expand these based on your rules)
    if (!preferredCity) throw new Error('Preferred city is required.');
    if (maxBudget === undefined || maxBudget < 0) throw new Error('Max budget must be a positive number.');
    if (smoking === undefined) throw new Error('Smoking preference is required.');
    if (pets === undefined) throw new Error('Pets preference is required.');
    if (!preferredLanguage) throw new Error('Preferred language is required.');
    if (!genderPreference) throw new Error('Gender preference is required.');

    // 2. Update the current user's preferences in the database
    currentUser.preferences = {
      ...currentUser.preferences, // Keep existing preferences that are not being updated
      ...dto,
    };

    await this.repository.save(currentUser); // Save the updated user preferences

    // 3. Return the updated user
    return currentUser;
  }
*/

  public async setPreferences(
    currentUser: User,
    preferencesDto: UserPreferencesDto
  ): Promise<User> {
    // Check and apply new preferences
    currentUser.preferences = {
      ...currentUser.preferences, // Retain existing preferences
      ...preferencesDto,          // Override with new values from DTO
    };

    // Save the user with updated preferences
    await this.repository.save(currentUser);

    return currentUser;
  }


  public async findPotentialRoommates(query: PaginateQueryRaw, currentUser: User): Promise<Paginated<User>> {
    const {
      preferredCity,
      maxBudget,
      smoking,
      pets,
      preferredLanguage,
      genderPreference,
    } = currentUser.preferences || {};

    // 1. Ensure the current user has set preferences
    if (!preferredCity || !maxBudget || smoking === undefined || pets === undefined || !preferredLanguage || !genderPreference) {
      throw new Error('Primero debes completar tus preferencias para utilizar esta funcionalidad');
    }

    // 2. Build the query with scoring mechanism
    const qb = this.repository.createQueryBuilder('user')
      .where('user.type = :type', { type: 'user' })
      .andWhere('user.id != :id', { id: currentUser.id }) // Exclude the current user
      .andWhere('user.preferences IS NOT NULL')
      .andWhere(`user.preferences ->> 'preferredCity' = :preferredCity`, { preferredCity })
      .andWhere(`user.preferences ->> 'maxBudget' IS NOT NULL`)
      .andWhere(`user.preferences ->> 'smoking' IS NOT NULL`)
      .andWhere(`user.preferences ->> 'pets' IS NOT NULL`)
      .andWhere(`user.preferences ->> 'preferredLanguage' IS NOT NULL`)
      .andWhere(`user.gender = :genderPreference`, { genderPreference: currentUser.preferences.genderPreference })

      // 3. Scoring mechanism
      .addSelect(`
        (
          CASE 
            WHEN user.preferences ->> 'smoking' = :smoking THEN 1 ELSE 0 END + 
            CASE WHEN user.preferences ->> 'pets' = :pets THEN 1 ELSE 0 END + 
            CASE WHEN user.preferences ->> 'preferredLanguage' = :preferredLanguage THEN 1 ELSE 0 END + 
            (1 - ABS((CAST(user.preferences ->> 'maxBudget' AS INTEGER) - :maxBudget) / NULLIF(:maxBudget, 0))) * 10
        )`, 'matchScore')

      // Add filtering by the user's preferences
      .setParameters({
        smoking: smoking.toString(),
        pets: pets.toString(),
        preferredLanguage,
        maxBudget,
      })

      // 4. Order by the calculated score
      .orderBy('matchScore', 'DESC');

    // 5. Execute the paginated query using your helper function
    return GetAllPaginatedQB(qb, query);
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
