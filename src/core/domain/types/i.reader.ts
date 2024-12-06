import { ID, IFindOptions } from "./types"

export interface IReader<T, C> {
    findAll(options?: IFindOptions<T, C>): Promise<T[]>
    find(value: Partial<T>, options?: IFindOptions<T, C>): Promise<T[]>
    findOne(id: ID | Partial<T>, options?: IFindOptions<T, C>): Promise<T>
    exist(id: ID | Partial<T>): Promise<boolean>
  }