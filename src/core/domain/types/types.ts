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
    private _fields: Array<keyof T>
    private _type: OrderByType

    constructor(fileds: Array<keyof T>, type: OrderByType){
        this._fields = fileds
        this._type = type
    }

    public value(){
        return {fields: this._fields, type: this._type}
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

export class WhereFilterParams {
    param: string = ""
    value: string = ""
    dbtype: string = ""

    constructor(param: string, value: string, dbtype: string) {
        this.param = param
        this.value = value
        this.dbtype = dbtype
    }
}

export class WhereFilters {
    AND: WhereFilterParams[]
    OR: WhereFilterParams[]

    constructor(and: WhereFilterParams[], or: WhereFilterParams[]) {
        this.AND = and
        this.OR = or
    }
}
