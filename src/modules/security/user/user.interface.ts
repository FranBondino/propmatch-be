export interface IUserUtils {
  hashPassword: (value: string) => Promise<string>
}