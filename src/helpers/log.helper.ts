import { EnumAction, EnumResource } from '../types/types'

export const logSignUpUser = (executingUser: any, resource: any) => ({
  action: EnumAction.signup,
  resource: EnumResource.user,
  executingUser,
  resourceId: resource.id,
  data: JSON.stringify(resource)
})

export const logCreateUser = (executingUser: any, resource: any) => ({
  action: EnumAction.create,
  resource: EnumResource.user,
  executingUser,
  resourceId: resource.id,
  data: JSON.stringify(resource),
})

export const logUpdateUser = (executingUser: any, resource: any) => ({
  action: EnumAction.update,
  resource: EnumResource.user,
  executingUser,
  resourceId: resource.id,
  data: JSON.stringify(resource),
})

export const logDeleteUser = (executingUser: any, resourceId: any) => ({
  action: EnumAction.delete,
  resource: EnumResource.user,
  executingUser,
  resourceId,
})

export const logPasswordReset = (executingUser: any, resource: any) => ({
  action: EnumAction.password_reset,
  resource: EnumResource.user,
  executingUser,
  resourceId: resource.id,
})