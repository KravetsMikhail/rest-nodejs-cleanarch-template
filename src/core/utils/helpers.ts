import { IFindOptions, Op, WhereFilters, WhereFilterParams } from "../domain/types/types"
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
        // let _andF = Object.entries(filters).map(([param, value]) => ({
        //     param,
        //     value
        // }))
        // let _f = new Filters(_andF, [])
        // return _f
        return {
            where: {
                [Op.and]: Object.entries(filters).map(([param, value]) => ({
                    param,
                    value
                }))
            }
        }
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
                                }
                                if (i < _finder.length - 1) {
                                    result += " AND "
                                }
                            }
                        }
                    }
                }
            }
        }

        return result
    }
}