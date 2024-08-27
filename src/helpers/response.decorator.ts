import { SetMetadata } from '@nestjs/common'

export const SetPaginatedType = (type: any) => SetMetadata('Type', type)
