import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import * as dotenv from 'dotenv'

dotenv.config()

export const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_DB_URL,
  synchronize: true,
  autoLoadEntities: true,
  ssl:
    process.env.DB_LOCAL === 'true'
      ? false
      : {
        rejectUnauthorized: false,
      },
  namingStrategy: new SnakeNamingStrategy(),
  entities: [`${__dirname}/../**/*.entity.{ts,js}`],
  migrations: [`${__dirname}/../migrations/**/*.{ts,js}`],
}