import { WinstonModule, utilities } from 'nest-winston'
import winston from 'winston'

import * as dotenv from 'dotenv'
dotenv.config()

const { LOG_LEVEL } = process.env

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        utilities.format.nestLike(null, {
          colors: true,
          prettyPrint: true
        })
      )
    })
  ],
  level: LOG_LEVEL || 'info'
})