import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { GetAllPaginatedQB } from '../../../helpers/pagination.helper'
import { Paginated, PaginateQueryRaw, UserPreferences, UserWithMatchScore } from '../../../types/types'
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

  private readonly logger = new Logger(UserService.name);


  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @Inject(USER_UTILS)
    private readonly userUtils: IUserUtils,
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
    userId: string,
    preferencesDto: UserPreferencesDto
  ): Promise<User> {
    const user = await this.repository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException("User not found");
    // Check and apply new preferences
    user.preferences = {
      ...user.preferences, // Retain existing preferences
      ...preferencesDto,          // Override with new values from DTO
    };

    // Save the user with updated preferences
    await this.repository.save(user);

    return user;
  }
  /*
    public async findPotentialRoommates(query: PaginateQueryRaw, userId: string): Promise<Paginated<User>> {
      const currentUser = await this.repository.findOne({ where: { id: userId } }); // Fetch the user by their ID
  
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
        .andWhere('user.id != :id', { id: currentUser.id })
        .andWhere('user.preferences IS NOT NULL')
        .andWhere(`user.preferences ->> 'preferredCity' = :preferredCity`, { preferredCity })
        .andWhere(`user.preferences ->> 'maxBudget' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'smoking' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'pets' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'preferredLanguage' IS NOT NULL`)
        .andWhere(`user.gender = :genderPreference`, { genderPreference: currentUser.preferences.genderPreference })
  
        // 3. Scoring mechanism with aliasing using double quotes
        .addSelect(`(
        CASE 
          WHEN user.preferences ->> 'smoking' = :smoking THEN 1 ELSE 0 END + 
          CASE WHEN user.preferences ->> 'pets' = :pets THEN 1 ELSE 0 END + 
          CASE WHEN user.preferences ->> 'preferredLanguage' = :preferredLanguage THEN 1 ELSE 0 END + 
          (1 - ABS((CAST(user.preferences ->> 'maxBudget' AS INTEGER) - :maxBudget) / NULLIF(:maxBudget, 0))) * 10
      )`, 'matchScore')  // Alias with double quotes
  
        .setParameters({
          smoking: smoking.toString(),
          pets: pets.toString(),
          preferredLanguage,
          maxBudget,
        })
  
        // 4. Order by the calculated score using the alias
        .orderBy('"matchScore"', 'DESC');
  
      // 5. Execute the paginated query
      return GetAllPaginatedQB(qb, query);
    }
  */
  /*
    public async findPotentialRoommates(query: PaginateQueryRaw, userId: string): Promise<Paginated<User>> {
      const currentUser = await this.repository.findOne({ where: { id: userId } }); // Fetch the user by their ID
    
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
    
      // 2. Build the query without scoring logic
      const qb = this.repository.createQueryBuilder('user')
        .where('user.type = :type', { type: 'user' })
        .andWhere('user.id != :id', { id: currentUser.id })
        .andWhere('user.preferences IS NOT NULL')
        .andWhere(`user.preferences ->> 'preferredCity' = :preferredCity`, { preferredCity })
        .andWhere(`user.preferences ->> 'maxBudget' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'smoking' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'pets' IS NOT NULL`)
        .andWhere(`user.preferences ->> 'preferredLanguage' IS NOT NULL`)
        .andWhere(`user.gender = :genderPreference`, { genderPreference: currentUser.preferences.genderPreference })
        .orderBy('user.id', 'DESC'); // Sort by user ID to ensure consistent ordering
    
      // 3. Fetch user data using the paginated query
      const users = await GetAllPaginatedQB(qb, query);
    
      // 4. Calculate score for each user in application logic
      const scoredUsers = users.map((user) => {
        const { preferences } = user;
        const score = (
          (preferences.smoking === currentUser.preferences.smoking ? 1 : 0) +
          (preferences.pets === currentUser.preferences.pets ? 1 : 0) +
          (preferences.preferredLanguage === currentUser.preferences.preferredLanguage ? 1 : 0) +
          (1 - Math.abs((preferences.maxBudget - currentUser.preferences.maxBudget) / currentUser.preferences.maxBudget)) * 10
        );
        return { ...user, score };
      });
    
      // 5. Sort by score (descending)
      scoredUsers.sort((a, b) => b.score - a.score);
    
      // 6. Return the sorted users with score
     return scoredUsers;
    } 
  */
  /*
   public async findPotentialRoommates(query: PaginateQueryRaw, userId: string): Promise<Paginated<User>> {
     const currentUser = await this.repository.findOne({ where: { id: userId } });
 
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
 
     // 2. Build the query
     const qb = this.repository.createQueryBuilder('user')
       .where('user.type = :type', { type: 'user' })
       .andWhere('user.id != :id', { id: currentUser.id })
       .andWhere('user.preferences IS NOT NULL')
       .andWhere(`user.preferences ->> 'preferredCity' = :preferredCity`, { preferredCity })
       .andWhere(`user.preferences ->> 'maxBudget' IS NOT NULL`)
       .andWhere(`user.preferences ->> 'smoking' IS NOT NULL`)
       .andWhere(`user.preferences ->> 'pets' IS NOT NULL`)
       .andWhere(`user.preferences ->> 'preferredLanguage' IS NOT NULL`)
       .andWhere(`user.gender = :genderPreference`, { genderPreference: currentUser.preferences.genderPreference })
 
     // 3. Fetch user data using the paginated query
     const paginatedUsers = await GetAllPaginatedQB(qb, query);
 
     // 4. Calculate score for each user in application logic
     const scoredUsers = paginatedUsers.rows.map((user) => {
       const { preferences } = user;
       const score = (
         (preferences.smoking === currentUser.preferences.smoking ? 1 : 0) +
         (preferences.pets === currentUser.preferences.pets ? 1 : 0) +
         (preferences.preferredLanguage === currentUser.preferences.preferredLanguage ? 1 : 0) +
         (1 - Math.abs((preferences.maxBudget - currentUser.preferences.maxBudget) / currentUser.preferences.maxBudget)) * 10
       );
       return { ...user, score } as UserWithMatchScore;
     });
 
     // 5. Sort by score (descending)
     scoredUsers.sort((a, b) => b.score - a.score);
 
     // 6. Return the sorted users with score, maintaining pagination structure
     return {
       ...paginatedUsers,
       rows: scoredUsers, // Replace the original items with scored ones
     };
   }
 */
  /*
    public async findPotentialRoommates(userId: string): Promise<User[]> {
      const currentUser = await this.repository.findOne({ where: { id: userId } });
    
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
    
      // 2. Retrieve all users (without pagination) who are not the current user and have preferences set
      const allUsers = await this.repository.createQueryBuilder('user')
        .where('user.type = :type', { type: 'user' })
        .andWhere('user.id != :id', { id: currentUser.id })
        .andWhere('user.preferences IS NOT NULL')
        .getMany();
    
      // 3. Filter and calculate score for each user
      const scoredUsers = allUsers
        .filter((user) => {
          const { preferences } = user;
    
          // Filter by the matching criteria (city, gender, etc.)
          return (
            preferences.preferredCity === currentUser.preferences.preferredCity &&
            preferences.maxBudget !== null &&
            preferences.smoking !== null &&
            preferences.pets !== null &&
            preferences.preferredLanguage !== null &&
            user.gender === currentUser.preferences.genderPreference
          );
        })
        .map((user) => {
          const { preferences } = user;
    
          // Calculate score based on matching preferences
          const score = (
            (preferences.smoking === currentUser.preferences.smoking ? 1 : 0) +
            (preferences.pets === currentUser.preferences.pets ? 1 : 0) +
            (preferences.preferredLanguage === currentUser.preferences.preferredLanguage ? 1 : 0) +
            (1 - Math.abs((preferences.maxBudget - currentUser.preferences.maxBudget) / currentUser.preferences.maxBudget)) * 10
          );
    
          return { ...user, score } as UserWithMatchScore;
        });
    
      // 4. Sort by score (descending order)
      scoredUsers.sort((a, b) => b.score - a.score);
    
      // 5. Return the scored and sorted users (without pagination)
      return scoredUsers;
    }
      */

  public async findPotentialRoommates(userId: string): Promise<UserWithMatchScore[]> {
    const currentUser = await this.repository.findOne({ where: { id: userId } });

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

    // 2. Retrieve all users (without pagination) who are not the current user and have preferences set
    const allUsers = await this.repository.createQueryBuilder('user')
      .where('user.type = :type', { type: 'user' })
      .andWhere('user.id != :id', { id: currentUser.id })
      .andWhere('user.preferences IS NOT NULL')
      .getMany();

    // 3. Filter and calculate score for each user
    const scoredUsers = allUsers
      .filter((user) => {
        const { preferences } = user;

        // Filter by the matching criteria (city, gender, etc.)
        return (
          preferences.preferredCity === currentUser.preferences.preferredCity &&
          user.gender === currentUser.preferences.genderPreference
        );
      })
      .map((user) => {
        const { preferences } = user;

        // Calculate score based on matching preferences
        const score = (
          (preferences.smoking === currentUser.preferences.smoking ? 1 : 0) +
          (preferences.pets === currentUser.preferences.pets ? 1 : 0) +
          (preferences.preferredLanguage === currentUser.preferences.preferredLanguage ? 1 : 0) +
          (1 - Math.abs((preferences.maxBudget - currentUser.preferences.maxBudget) / currentUser.preferences.maxBudget)) * 10
        );

        // Return user with calculated score
        return { ...user, score } as UserWithMatchScore;
      });

    // 4. Sort by score (descending order)
    scoredUsers.sort((a, b) => b.score - a.score);

    // 5. Return the scored and sorted users (without pagination)
    return scoredUsers;
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
