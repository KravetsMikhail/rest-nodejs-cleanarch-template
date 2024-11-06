import { ID } from "./types"

export interface IWriter<T> {
    create(value: Partial<T>): Promise<T>
    createMany(values: Partial<T>[]): Promise<T[]>
    update(id: ID, newValue: Partial<T>): Promise<T>
    delete(id: ID): Promise<any>
  }