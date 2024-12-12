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
            [Op.and]: Object.entries(filters).map(([param, value]) => ({
                param,
                value
            }))
        } as unknown as WhereFilters
        let _order = filters.order
        let _sort = filters.sort
        delete filters.order
        delete filters.sort
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
                if (_opt && _opt.AND) {
                    let _finder: WhereFilterParams[] = []
                    _opt.AND.map(o => {
                        let _f = _reflect?.find(r => r.field == o["param"])
                        if (_f) {
                            _finder.push(new WhereFilterParams(o["param"], o["value"], _f.type))
                        }
                    })
                    if (_finder) {
                        _finder = _finder.filter(f => f !== undefined)
                        if (_finder && _finder.length > 0) {
                            result += "where "
                            for (let i = 0; i < _finder.length; i++) {
                                switch (_finder[i].dbtype) {
                                    case "String":
                                        result += `${dbScheme ? dbScheme + "." : ""}"${table}"."${_finder[i].param}" LIKE('%${_finder[i].value}%')`
                                        break
                                    case "Number":
                                        result += `${dbScheme ? dbScheme + "." : ""}"${table}"."${_finder[i].param}" = ${_finder[i].value}`
                                        break
                                    case "Boolean":
                                        let val: boolean = /^true$/i.test(_finder[i].value)
                                        result += `${dbScheme ? dbScheme + "." : ""}"${table}"."${_finder[i].param}" = ${val ? "True" : "False"}`
                                        break
                                    case "ID":
                                        //РЕАЛИЗОВАТЬ
                                        break
                                    case "Date":
                                        //РЕАЛИЗОВАТЬ
                                        break
                                    case "JSON":
                                        //РЕАЛИЗОВАТЬ
                                        break
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
        return result
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