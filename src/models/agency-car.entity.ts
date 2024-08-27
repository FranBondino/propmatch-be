import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
} from 'typeorm'
import { BaseModel } from './base-model.entity'
import { Image } from './image.entity'

export interface CarAttributes {
  'Rodado': string | null
  'Tapizado': string | null
  'Aire acondicionado': boolean,
  'Calefaccion auxiliar': boolean,
  'Techo panoramico': boolean,
  'Velocidad crucero': boolean,
  'Bluetooth': boolean,
  'GPS': boolean,
  'Sensores de estacionamiento': boolean,
  'ABS': boolean,
  'Airbags': boolean,
  'Cierre centralizado': boolean,
  'Cobertor de caja': boolean,
  'Direccion asistida': boolean,
  'Inmovilizador': boolean,
  'Camara trasera': boolean,
  'Control de estabilidad': boolean,
  'Baranda antivuelco': boolean,
  'Caja de herramientas': boolean,
  'Estribos': boolean,
  'Espejo lateral electrico': boolean,
  'Llantas de aleacion': boolean,
  'Paquete deportivo': boolean,
  'Suspension deportiva': boolean,
}

export const defaultCarAttributes: CarAttributes = {
  'Rodado': null,
  'Tapizado': null,
  'Aire acondicionado': false,
  'Calefaccion auxiliar': false,
  'Techo panoramico': false,
  'Velocidad crucero': false,
  'Bluetooth': false,
  'GPS': false,
  'Sensores de estacionamiento': false,
  'ABS': false,
  'Airbags': false,
  'Cierre centralizado': false,
  'Cobertor de caja': false,
  'Direccion asistida': false,
  'Inmovilizador': false,
  'Camara trasera': false,
  'Control de estabilidad': false,
  'Baranda antivuelco': false,
  'Caja de herramientas': false,
  'Estribos': false,
  'Espejo lateral electrico': false,
  'Llantas de aleacion': false,
  'Paquete deportivo': false,
  'Suspension deportiva': false,
}

@Entity()
export class AgencyCar extends BaseModel {
  @Column()
  make: string

  @Column()
  model: string

  @Column()
  color: string

  @Column()
  year: number

  @Column()
  price: number

  @Column({ default: 'ARS' })
  currency: string

  @Column()
  condition: string

  @Column({ nullable: true })
  fuel: string

  @Column({ nullable: true })
  transmision?: string

  @Column({ nullable: true })
  km: number

  @Column({ nullable: true })
  videoUrl?: string

  @Column('json', { default: defaultCarAttributes })
  attributes: CarAttributes

  @ManyToMany(() => Image, { cascade: true })
  @JoinTable()
  images: Image[]
}
