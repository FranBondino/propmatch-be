import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { UserService } from '../security/user/user.service'
import * as dotenv from 'dotenv'
import { User } from '../../models/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

dotenv.config()

const { ENV } = process.env

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly password = 'Test123456'

  private hashedPassword: string

  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async onApplicationBootstrap() {
    await this.seed(ENV)
  }

  public async seed(env: string) {
    const existingUser = await this.userRepo.findOneBy(null)
    if (existingUser) return
    console.log('[SEEDER] seeding application...')
    this.hashedPassword = await this.userService.hashPassword(this.password)

    const adminUser = await this.seedAdminUser()

    console.log(`[ADMIN ACCOUNT] \nemail: ${adminUser.email} \npassword: ${this.password} \nPlease change it ASAP`)

    if (env === 'DEV') {
      console.log('Seeding dev data...')
    }
  }

  private async seedAdminUser(): Promise<User> {
    const user = new User()
    user.fullName = 'Admin'
    user.email = 'admin@system.com'
    user.password = this.hashedPassword
    user.type = 'admin'

    return user.save()
  }
}