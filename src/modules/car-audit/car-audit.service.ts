import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { Car } from '../../models/renting/car.entity';
import { CarAudit } from '../../models/renting/car-audit.entity';
import { Paginated, PaginateQueryRaw } from '../../types/types';
import { GetAllPaginatedQB } from '../../helpers/pagination.helper';

@Injectable()
export class CarAuditService {
  constructor(
    @InjectRepository(CarAudit)
    private readonly repository: Repository<CarAudit>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async logAction(
    carId: string,
    action: string,
    changes: { old: Record<string, any>; new: Record<string, any> },
    userId: string,
  ): Promise<void> {
    const car = await this.carRepository.findOneBy({ id: carId });
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!car || !user) {
      throw new Error('Car or User not found');
    }

    const carAudit = this.repository.create({
      car,
      user,
      action,
      changes,
    });
    await this.repository.save(carAudit);
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<CarAudit>> {
    const qb = this.repository.createQueryBuilder('carAudit')
      .leftJoinAndSelect('carAudit.user', 'user')
      .leftJoinAndSelect('carAudit.car', 'car');
    
    if (query.search) {
      qb.andWhere('carAudit.action = :action', { action: query.search })
      qb.orWhere(`LOWER(user.name) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(car.make) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(car.model) ILIKE '%${query.search.toLocaleLowerCase()}%'`);
    }

    return GetAllPaginatedQB<CarAudit>(qb, query);
  }
}
