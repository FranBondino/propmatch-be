import { CarRent } from '../../models/renting/car-rent.entity'
import { EntityRepository, Repository } from 'typeorm'

@EntityRepository(CarRent)
export class CarRentRepository extends Repository<CarRent> { }


