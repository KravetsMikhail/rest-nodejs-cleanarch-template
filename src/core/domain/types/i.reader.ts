import { ID, IFindOptions } from "./types"

export interface IReader<T, C> {
    //find(value: Partial<T>, options?: IFindOptions<T, C>): Promise<T[]>
    find(options?: IFindOptions<T, C>): Promise<T[]>
    findOne(id: ID | Partial<T>, options?: IFindOptions<T, C>): Promise<T>
    exist(id: ID | Partial<T>): Promise<boolean>
  }