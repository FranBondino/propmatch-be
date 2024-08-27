import { User } from '../../../models/user.entity'

export class CreateLogDto {
  resource: string

  resourceId: string

  action: string

  executingUser: User
}
