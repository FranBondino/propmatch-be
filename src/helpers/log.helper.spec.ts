import { v4 } from 'uuid'
import * as logHelper from './log.helper'

describe('log.helper', () => {
  it('Every function should return an object with the log properties', () => {
    const keys = Object.keys(logHelper)
    const executingUser = { id: v4() }
    const resource = { id: v4(), data: 'test' }

    for (const key of keys) {
      const res = logHelper[key](executingUser, resource)
      expect(res).toHaveProperty('action')
      expect(res).toHaveProperty('resource')
      expect(res).toHaveProperty('executingUser')
      expect(res).toHaveProperty('resourceId')
    }
  })
})