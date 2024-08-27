import { IUserUtils } from '../user.interface'

export class UserUtilsTestImpl implements IUserUtils {
  public async hashPassword(value: string): Promise<string> {
    return value
  }
}
