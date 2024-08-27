import { JwtModuleOptions } from '@nestjs/jwt'
import * as dotenv from 'dotenv'

dotenv.config()

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET,
}

export const EXPIRATION_TOKEN_RESET_PASSWORD = '2h'