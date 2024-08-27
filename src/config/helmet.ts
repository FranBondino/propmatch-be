/* eslint-disable @typescript-eslint/quotes */
import { HelmetOptions } from 'helmet'

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      'img-src': ["'self", 'https: data blob:', 'http: data blob', 'data:', 'validator.swagger.io'],
      defaultSrc: [`'self'`],
      styleSrc: [`'self'`, `'unsafe-inline'`],
      scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
    }
  }
}