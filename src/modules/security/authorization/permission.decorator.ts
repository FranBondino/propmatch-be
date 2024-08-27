import { SetMetadata } from '@nestjs/common'
import { UserTypes } from '../../../types/types'

export const ALLOWED_USERS = 'ALLOWED_USERS'
export const AllowedUsers = (...data: UserTypes[]) => SetMetadata(ALLOWED_USERS, data)
