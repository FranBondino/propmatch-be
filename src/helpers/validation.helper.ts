/* eslint-disable max-len */
import { PreconditionFailedException } from '@nestjs/common'
import {
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator'

export class IdParamRequired {
  @IsString()
  @IsUUID('4')
  id: string
}

export class IdParamOptional {
  @IsOptional()
  @IsString()
  @IsUUID('4')
  id: string
}

export const getOptionsFromJSON = (queryOptions: any) => {
  try {
    let options = null
    if (queryOptions.options) {
      if (typeof queryOptions.options !== 'string') throw new Error()
      options = JSON.parse(queryOptions.options)
    }
    return options
  } catch (error) {
    throw new PreconditionFailedException('the query "options" is not a JSON')
  }
}
