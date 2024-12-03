import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { SetPaginatedType } from '../../../helpers/response.decorator'
import { IdRequired } from '../../../helpers/helper.dto'
import {
  logCreateUser,
  logDeleteUser,
  logUpdateUser,
} from '../../../helpers/log.helper'
import { ResponseInterceptor } from '../../../helpers/response.interceptor'
import { getOptionsFromJSON } from '../../../helpers/validation.helper'
import { Paginated, PaginateQueryRaw, UserType, UserWithMatchScore } from '../../../types/types'
import { JwtAuthGuard } from '../auth/auth.guard'
import { AllowedUsersGuard } from '../authorization/allowed-user-type.guard'
import { AllowedUsers } from '../authorization/permission.decorator'
import { LogService } from '../log/log.service'
import {
  CreateUserDto,
  UpdateUserDto,
  UserPreferencesDto,
  UserResponseDto
} from './user.dto'
import { UserService } from './user.service'
import { User } from '../../../models/user.entity'

@Controller('users')
@UseInterceptors(ResponseInterceptor, ClassSerializerInterceptor)
export class UserController {
  private readonly logger = new Logger(UserController.name) // Define logger

  constructor(
    private readonly service: UserService,
    private readonly logService: LogService,
  ) { }

  @Post()
  @AllowedUsers(UserType.admin)
  public async create(@Body() dto: CreateUserDto, @Req() req: Request): Promise<UserResponseDto> {
    await this.service.isEmailFree(dto.email)

    const obj = await this.service.create(dto)
    await this.logService.create(logCreateUser(req.user, obj.id))
    return obj
  }

  @Post('/signup')
  @AllowedUsers(UserType.user, UserType.owner)
  public async signup(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.service.signup(dto)
    return user
  }

  @Post('/contacts/:contactId')
  @UseGuards(JwtAuthGuard)
  public async addContact(
    @Param('contactId') contactId: string,
    @Req() req: Request
  ): Promise<User[]> {
    const user = req.user as User;

    // Log adding contact action
    this.logger.log(`User ${user.id} is adding contact ${contactId}`);

    // Call service to add contact
    return this.service.addContact(user.id, contactId);
  }

  @Delete('/contacts/:userId/:contactId')
  @UseGuards(JwtAuthGuard)
  public async deleteContact(
    @Param('contactId') contactId: string,
    @Req() req: Request
  ): Promise<void> {
    const user = req.user as User;

    // Log deleting contact action
    this.logger.log(`User ${user.id} is deleting contact ${contactId}`);

    // Call service to delete contact
    await this.service.deleteContact(user.id, contactId);
  }

  @Put()
  public async update(@Body() dto: UpdateUserDto, @Req() req: Request): Promise<void> {
    if (dto.email) await this.service.isEmailFree(dto.email, dto.id)

    const obj = await this.service.update(dto)
    await this.logService.create(logUpdateUser(req.user, obj.id))
  }

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  public async getCurrentUser(@Req() req: Request, @Query() queryOptions: any): Promise<UserResponseDto> {
    const options = getOptionsFromJSON(queryOptions)
    const user = req.user as User;

    return this.service.getById(user.id, options)
  }

  @Get('/:id')
  public async get(@Param() { id }: IdRequired, @Query() queryOptions: any): Promise<UserResponseDto> {
    const options = getOptionsFromJSON(queryOptions)
    return this.service.getById(id, options)
  }

  @Get()
  @SetPaginatedType(UserResponseDto)
  public async getAll(@Query() query: PaginateQueryRaw): Promise<Paginated<UserResponseDto>> {
    return this.service.getAll(query)
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  public async setPreferences(@Body() dto: UserPreferencesDto, @Req() req: Request): Promise<User> {
    const user = req.user as User;

    // Update the preferences using the service
    return this.service.setPreferences(user.id, dto);
  }

  @Get('/matching/find-roommates')
  @UseGuards(JwtAuthGuard)
  public async getPotentialRoommates(@Req() req: Request): Promise<UserWithMatchScore[]> {
    const user = req.user as User;

    // Log the authenticated user's ID
    this.logger.log(`Fetching potential roommates for user ID: ${user.id}`);

    // Check if the user has the right type
    if (user.type !== UserType.user) {
      throw new ForbiddenException('This functionality is only available to users.');
    }

    // Call the updated service method (no pagination needed anymore)
    return this.service.findPotentialRoommates(user.id);
  }

  @Get('/contacts')
  @UseGuards(JwtAuthGuard)
  public async getContacts(
    @Req() req: Request, 
    @Query() query: PaginateQueryRaw // Get pagination query
  ): Promise<Paginated<User>> {
    const user = req.user as User;
    
    // Log retrieving contacts action
    this.logger.log(`User ${user.id} is fetching their contacts`);

    // Call service to get paginated contacts
    return this.service.getContacts(user.id, query);
  }


  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired, @Req() req: any): Promise<void> {
    await this.service.deleteById(id)
    await this.logService.create(logDeleteUser(req.user, id))
  }
}
