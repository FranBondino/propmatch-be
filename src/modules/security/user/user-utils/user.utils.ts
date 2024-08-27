import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { IUserUtils } from '../user.interface'

export const USER_UTILS = 'USER_UTILS'

@Injectable()
export class UserUtilsImpl implements IUserUtils {
  public async hashPassword(value: string): Promise<string> {
    return bcrypt.hash(value, 12)
  }
}