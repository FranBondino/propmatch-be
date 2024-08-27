import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { newDb, IMemoryDb, DataType } from 'pg-mem'
import { Connection } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { v4 } from 'uuid'

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  entities: [`${__dirname}/../**/*.entity.{ts,js}`],
  namingStrategy: new SnakeNamingStrategy(),
}

export class TestingDB {
  private static instance: TestingDB

  private db: IMemoryDb

  public conn: Connection

  public static getInstance(): TestingDB {
    if (!this.instance) this.instance = new TestingDB()
    return this.instance
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this.db = newDb({ autoCreateForeignKeyIndices: true })

    this.db.public.registerFunction({
      implementation: () => 'test',
      name: 'current_database',
    })

    this.db.public.registerFunction({
      implementation: () => 'test',
      name: 'version',
    })

    this.db.registerExtension('uuid-ossp', (schema) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        returns: DataType.uuid,
        implementation: v4,
        impure: true,
      })
    })

  }

  public async initialize(): Promise<Connection> {
    if (this.conn) return this.conn

    this.conn = await this.db.adapters.createTypeormConnection(config)
    await this.conn.synchronize()

    return this.conn
  }
}