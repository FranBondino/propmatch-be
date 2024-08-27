import { HttpStatus } from '@nestjs/common'

const {
  NOT_FOUND,
  BAD_REQUEST,
  UNAUTHORIZED,
  CONFLICT
} = HttpStatus


export const errorsCatalogs = {
  EMAIL_OR_PASSWORD_INVALID: {
    message: 'Email or password invalid',
    code: 'EMAIL_OR_PASSWORD_INVALID',
    httpStatus: UNAUTHORIZED
  },
  PASSWORD_INVALID: {
    message: 'password invalid',
    code: 'PASSWORD_INVALID',
    httpStatus: UNAUTHORIZED
  },
  LOG_NOT_FOUND: {
    message: 'The log was not found',
    code: 'LOG_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  USER_NOT_FOUND: {
    message: 'User was not found',
    code: 'USER_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  USER_EMAIL_NOT_FOUND: {
    message: 'Could not find a user with that email',
    code: 'USER_EMAIL_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  USER_EMAIL_TAKEN: {
    message: 'That user email is already taken',
    code: 'USER_EMAIL_TAKEN',
    httpStatus: BAD_REQUEST
  },
  NOT_AUTHENTICATED: {
    message: 'User not authenticated',
    code: 'NOT_AUTHENTICATED',
    httpStatus: UNAUTHORIZED
  },
  CLIENT_NOT_FOUND: {
    message: 'Client was not found',
    code: 'CLIENT_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  APARTMENT_NOT_FOUND: {
    message: 'Apartment was not found',
    code: 'APARTMENT_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  EXPENSE_NOT_FOUND: {
    message: 'Expense was not found',
    code: 'EXPENSE_NOT_FOUND',
  },
  APARTMENT_RENT_NOT_FOUND: {
    message: 'Apartment rent was not found',
    code: 'APARTMENT_RENT_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  CAR_NOT_FOUND: {
    message: 'Car was not found',
    code: 'CAR_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  CAR_RENT_NOT_FOUND: {
    message: 'Car rent was not found',
    code: 'CAR_RENT_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  AGENCY_PROCEDURE_NOT_FOUND: {
    message: 'Agency procedure was not found',
    code: 'AGENCY_PROCEDURE_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  AGENCY_CAR_NOT_FOUND: {
    message: 'Agency car was not found',
    code: 'AGENCY_CAR_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  IMAGE_NOT_FOUND: {
    message: 'Image was not found',
    code: 'IMAGE_NOT_FOUND',
    httpStatus: NOT_FOUND
  },
  APARTMENT_HAS_RENTS: {
    message: 'Apartment has rents',
    code: 'APARTMENT_HAS_RENTS',
    httpStatus: CONFLICT
  },
  CAR_HAS_RENTS: {
    message: 'Car has rents',
    code: 'CAR_HAS_RENTS',
    httpStatus: CONFLICT
  },
}
