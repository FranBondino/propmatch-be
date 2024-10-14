import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { Paginated, PaginateQueryRaw, UserType } from '../../../types/types'
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

  @Put()
  public async update(@Body() dto: UpdateUserDto, @Req() req: Request): Promise<void> {
    if (dto.email) await this.service.isEmailFree(dto.email, dto.id)

    const obj = await this.service.update(dto)
    await this.logService.create(logUpdateUser(req.user, obj.id))
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

  @Post('preferences')
  @UseGuards(JwtAuthGuard)
  public async setPreferences(@Body() dto: UserPreferencesDto, @Req() req: Request): Promise<User> {
    const currentUser: User = req.user as User;

    // Update the preferences using the service
    return this.service.setPreferences(currentUser, dto);
  }

  @Get('find-roommates')
@UseGuards(JwtAuthGuard)
public async getPotentialRoommates(@Query() query: PaginateQueryRaw, @Req() req: Request): Promise<Paginated<User>> {
  const currentUser: User = req.user as User;

  if (currentUser.type !== UserType.user) {
    throw new ForbiddenException('This functionality is only available to users.');
  }

  return this.service.findPotentialRoommates(query, currentUser);
}

  @Delete('/:id')
  public async delete(@Param() { id }: IdRequired, @Req() req: any): Promise<void> {
    await this.service.deleteById(id)
    await this.logService.create(logDeleteUser(req.user, id))
  }
}
