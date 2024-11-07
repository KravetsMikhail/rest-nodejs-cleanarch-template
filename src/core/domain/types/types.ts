export type AnyObject = Record<string, any>

export type ColumnData = string | {
  name: string
  hidden?: boolean
}

export type ID = string | number

export interface IFindOptions<T, C> {
    select?: Array<keyof T>
    tx?: C
  }