import internal from "stream"

export type AnyObject = Record<string, any>

export type ColumnData = string | {
    name: string
    hidden?: boolean
}

export type ID = string | number

export interface IFindOptions<T, C> {
    where?: Array<keyof T>
    offset?: number
    limit?: number
    orderBy?: OrderBy<T, OrderByType>
    tx?: C
}

export class OrderBy<T, OrderByType>{
    private _field: keyof T
    private _type: OrderByType

    constructor(filed: keyof T, type: OrderByType){
        this._field = filed
        this._type = type
    }

    public value(){
        return {field: this._field, type: this._type}
    }
}

export class OrderByType {
    public static desc = 'DESC'
    public static asc = 'ASC'
}

export class Op {
    public static and = 'AND'
    public static or = 'OR'
}