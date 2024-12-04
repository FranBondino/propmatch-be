import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { ApartmentAudit } from '../../models/renting/apartment-audit.entity';
import { Paginated, PaginateQueryRaw } from '../../types/types';
import { GetAllPaginatedQB } from '../../helpers/pagination.helper';
import { Apartment } from '../../models/renting/apartment.entity';

@Injectable()
export class ApartmentAuditService {
  constructor(
    @InjectRepository(ApartmentAudit)
    private readonly repository: Repository<ApartmentAudit>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async logAction(
    apartmentId: string,
    action: string,
    changes: { old: Record<string, any>; new: Record<string, any> },
    userId: string,
  ): Promise<void> {
    const apartment = await this.apartmentRepository.findOne({ 
      where: {id: apartmentId },
     })
    const user = await this.userRepository.findOne({ 
      where: {id: userId} 
    });

    if (!apartment || !user) {
      throw new Error('Apartment or User not found');
    }

    const apartmentAudit = this.repository.create({
      apartment,
      user,
      action,
      changes,
    });
    await this.repository.save(apartmentAudit);
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<ApartmentAudit>> {
    const qb = this.repository.createQueryBuilder('apartmentAudit')
      .leftJoinAndSelect('apartmentAudit.user', 'user')
      .leftJoinAndSelect('apartmentAudit.apartment', 'apartment');
    
    if (query.search) {
      qb.andWhere('apartmentAudit.action = :action', { action: query.search })
      qb.orWhere(`LOWER(user.fullName) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(apartment.fullAddress) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
      qb.orWhere(`LOWER(apartment.city) ILIKE '%${query.search.toLocaleLowerCase()}%'`);
    }

    return GetAllPaginatedQB<ApartmentAudit>(qb, query);
  }
}
