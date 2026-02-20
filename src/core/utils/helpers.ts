import { IFindOptions, Op, WhereFilters, WhereFilterParams, OrderBy, OrderByType } from "../domain/types/types"
import { GetReflectionTypes } from "../domain/types/reflections"

export class Helpers {
    public static toStrToLowAndRemSpaces(value: any): string {
        if (value) {
            return value.toString().toLowerCase().replace(/\s/g, '')
        } else {
            return ""
        }
    }

    public static getFilters(filters: { [key: string]: any }): any {
        if (!filters) return       
               
        let _where = {
            [Op.and]: Object.entries(filters)
            .filter(([param]) => param !== 'limit' && param !== 'offset' && param !== '_order' && param !== '_sort')
            .map(([param, value]) => ({
                param,
                value
            }))
        } as unknown as WhereFilters
        let _order = filters._order
        let _sort = filters._sort
        delete filters._order
        delete filters._sort
        let _orderBy = null
        if (_sort) {
            let _ord = OrderByType.asc
            switch (_order) {
                case "desc":
                    _ord = OrderByType.desc
                    break
                default:
                    _ord = OrderByType.asc
            }
            let _fields = _sort.toString().split(',')
            _orderBy = new OrderBy(_fields, _ord)
        }
        let _offset = filters.offset
        delete filters.offset
        let _limit = filters.limit
        delete filters.limit

        let result = {
            where: {},
            orderBy: {},
            offset: 0,
            limit: 10000,
            tx: {},
        }
        if (_where) result.where = _where
        if (_orderBy) result.orderBy = _orderBy
        if (_offset) result.offset = Array.isArray(_offset) ? _offset[0] : _offset
        if (_limit) result.limit = Array.isArray(_offset) ? _limit[0] : _limit

        return result
    }

    public static getWhereForPostgreSql(model: any, options: IFindOptions<any, any>, dbScheme: string | undefined, table: string): string {
        let _reflect = GetReflectionTypes(model)
        let result = ""
        for (const p of Object.getOwnPropertyNames(options)) {
            if (p === 'where') {
                const _opt = (options as unknown as typeof model).where as WhereFilters
                console.log(_opt)
                if (_opt && _opt.AND) {
                    let _finder: WhereFilterParams[] = []
                    _opt.AND.map(o => {
                        const rawParam = o["param"] || ""
                        const { baseParam, operator } = Helpers.parseParamOperator(rawParam)
                        let _f = _reflect?.find(r => r.field == baseParam)
                        if (_f) {
                            const wpf = new WhereFilterParams(baseParam, o["value"], _f.type)
                            ;(wpf as any).operator = operator
                            _finder.push(wpf)
                        }
                    })
                    if (_finder) {
                        _finder = _finder.filter(f => f !== undefined)
                        if (_finder && _finder.length > 0) {
                            result += "where "
                            for (let i = 0; i < _finder.length; i++) {
                                const col = `${dbScheme ? dbScheme + "." : ""}"${table}"."${_finder[i].param}"`
                                const val = _finder[i].value
                                const op = (_finder[i] as any).operator || "eq"

                                switch (_finder[i].dbtype) {
                                    case "String":
                                        if (op === "like") {
                                            result += `${col} ILIKE '%${Helpers.escapeSQL(val)}%'`
                                        } else {
                                            result += `${col} = '${Helpers.escapeSQL(val)}'`
                                        }
                                        break
                                    case "Number":
                                    case "BigInt":
                                        result += `${col} ${Helpers.sqlOperator(op)} ${val}`
                                        break
                                    case "Boolean":
                                        const boolVal: boolean = /^true$/i.test(val)
                                        result += `${col} = ${boolVal ? "True" : "False"}`
                                        break
                                    case "ID":
                                        result += `${col} ${Helpers.sqlOperator(op)} ${val}`
                                        break
                                    case "Date":
                                        const dateVal = Helpers.formatDateForSQL(val)
                                        result += `${col} ${Helpers.sqlOperator(op)} '${dateVal}'`
                                        break
                                    case "JSON":
                                        if (op === "contains") {
                                            result += `${col} @> '${Helpers.escapeSQL(val)}'::jsonb`
                                        } else if (op === "key") {
                                            const [jsonKey, jsonVal] = val.split(":")
                                            result += `${col}->>'${Helpers.escapeSQL(jsonKey)}' = '${Helpers.escapeSQL(jsonVal || "")}'`
                                        } else {
                                            result += `${col}::text ILIKE '%${Helpers.escapeSQL(val)}%'`
                                        }
                                        break
                                    case "Array":
                                        result += `'${Helpers.escapeSQL(val)}' = ANY(${col})`
                                        break
                                    default:
                                        result += `${col} = '${Helpers.escapeSQL(val)}'`
                                }
                                if (i < _finder.length - 1) {
                                    result += " AND "
                                }
                            }
                        }
                    }
                }
                break
            }
        }
        console.log(result)
        return result
    }

    private static parseParamOperator(param: string): { baseParam: string, operator: string } {
        const suffixes = ["_gte", "_lte", "_gt", "_lt", "_like", "_contains", "_key", "_ne"]
        for (const suffix of suffixes) {
            if (param.endsWith(suffix)) {
                return {
                    baseParam: param.slice(0, -suffix.length),
                    operator: suffix.slice(1)
                }
            }
        }
        return { baseParam: param, operator: "eq" }
    }

    private static sqlOperator(op: string): string {
        switch (op) {
            case "gte": return ">="
            case "lte": return "<="
            case "gt": return ">"
            case "lt": return "<"
            case "ne": return "<>"
            case "eq":
            default: return "="
        }
    }

    private static escapeSQL(value: string): string {
        if (!value) return ""
        return value.replace(/'/g, "''")
    }

    private static formatDateForSQL(value: string): string {
        if (!value) return ""
        const date = new Date(value)
        if (isNaN(date.getTime())) {
            return Helpers.escapeSQL(value)
        }
        return date.toISOString().replace("T", " ").replace("Z", "")
    }

    public static getOrderByForPostgreSql(model: any, options: IFindOptions<any, any>, dbScheme: string | undefined, table: string): string {
        let _reflect = GetReflectionTypes(model)
        let result = ""
        if(!options || !options.orderBy) return result
        for (const p of Object.getOwnPropertyNames(options)) {
            if (p === 'orderBy') {
                const _opt = options.orderBy as unknown as OrderBy<any, any>
                if(Object.keys(_opt).length === 0 && _opt.constructor === Object){
                    break
                }
                let _finderfileds = ""
                _opt.value().fields.map(o => {
                    let _f = _reflect?.find(r => r.field == o)
                    if (_f) {
                        _finderfileds += `${dbScheme ? dbScheme + "." : ""}"${table}"."${_f.field}" ${_opt.value().type}, `
                    }
                })
                
                if(_finderfileds){
                    _finderfileds = _finderfileds.substring(0, _finderfileds.length - 2)
                    result = `ORDER BY ${_finderfileds}`
                } 
                break               
            }
        }

        return result
    }

    public static getPagingForPostgresSql(options: IFindOptions<any, any>): string {
        let result = ""
        let _limit = options && options.limit ? options.limit as number : 10000
        let _offset = options && options.offset
        result = `LIMIT ${_limit} ${_offset ? "OFFSET " + _offset : ""}`
        return result
    }
}