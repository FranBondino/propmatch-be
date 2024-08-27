import { UnhandledErrorData } from '../models/error.entity'
import { EntityRepository, Repository } from 'typeorm'

@EntityRepository(UnhandledErrorData)
export class UnhandledErrorDataRepository extends Repository<UnhandledErrorData> { }
