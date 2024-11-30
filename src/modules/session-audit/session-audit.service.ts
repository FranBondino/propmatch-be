import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../models/user.entity';
import { ApartmentAudit } from '../../models/renting/apartment-audit.entity';
import { Paginated, PaginateQueryRaw } from '../../types/types';
import { GetAllPaginatedQB } from '../../helpers/pagination.helper';
import { SessionAudit } from '../../models/session-audit.entity';

@Injectable()
export class SessionAuditService {
  constructor(
    @InjectRepository(SessionAudit)
    private readonly repository: Repository<SessionAudit>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async logAction(
    action: string,
    userId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    const sessionAudit = this.repository.create({
      user,
      action,
    });
    await this.repository.save(sessionAudit);
  }

  public async getAll(query: PaginateQueryRaw): Promise<Paginated<SessionAudit>> {
    const qb = this.repository.createQueryBuilder('sessionAudit')
      .leftJoinAndSelect('sessionAudit.user', 'user')
    
    if (query.search) {
      qb.andWhere('sessionAudit.action = :action', { action: query.search })
      qb.orWhere(`LOWER(user.fullName) ILIKE '%${query.search.toLocaleLowerCase()}%'`)
    }

    return GetAllPaginatedQB<SessionAudit>(qb, query);
  }
}
