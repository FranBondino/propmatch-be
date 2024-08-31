import 'reflect-metadata'
import { Type } from 'class-transformer'

export interface PaginateQueryRaw {
  page?: string,
  take?: string,
  search?: string
  order?: string
}

export interface RentPaginateQueryRaw extends PaginateQueryRaw {
  startedAt?: Date
  endedAt?: Date
  city?: string
  fullAddress?: string
}

export interface Metadata {
  totalPages: number
  totalItems: number
  itemsPerPage: number
  currentPage: number
}

export class Paginated<T> {
  // eslint-disable-next-line
  constructor(private type?: Function) { }

  @Type((options) => (options.newObject as Paginated<T>).type)
  rows: T[]

  metadata: Metadata
}

export class Response<T> {
  status: boolean

  message?: string

  data: T
}

export interface ResetPasswordToken {
  userId: string
}

export enum EnumBannedTokenType {
  RESET_PASSWORD = 'RESET_PASSWORD',
  AUTH = 'AUTH'
}

export enum EnumAction {
  create = 'create',
  update = 'update',
  delete = 'delete',
  signup = 'signup',
  password_reset = 'password_reset',
}

export enum EnumResource {
  user = 'account',
}

export enum UserType {
  admin = 'admin',
  owner = 'owner',
  user = 'user',
}

export type UserTypes = keyof typeof UserType

export enum GenderType {
  male = 'male', 
  female = 'female'
}

export type ExpenseType = 'Apartment' | 'Car'

export type GenderTypes = 'male'
  | 'female'

export interface GenderPercentage {
  gender: string,
  percentage: number
}

export interface AverageRentByCity {
  city: string,
  averageRent: number
}

export type ExpenseDescriptionAverageCost = {
  description: string,
  averageCost: number
}[]

export interface MonthlyApartmentExpenseCostAugmentRate {
  month: number,
  year: number,
  augmentRate: number,
  apartmentAddress: string,
  expenseDescription: string
}

export interface MonthlyCarExpenseCostAugmentRate {
  month: number,
  year: number,
  augmentRate: number,
  carModel: string,
  expenseDescription: string
}

export interface TopRentedApartment {
  apartmentId: string,
  address: string,
  count: number
}

export interface TopRentedCar {
  carId: string,
  model: string,
  color: string,
  make: string,
  count: number
}

export interface RentalMonthFrequency {
  month: number,
  frequency: number
}
