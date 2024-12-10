import { IFindOptions, Op } from "../domain/types/types"
import { GetReflectionTypes } from "../domain/types/reflections"

export class Helpers {
    public static toStrToLowAndRemSpaces(value: any): string {
        if (value) {
            return value.toString().toLowerCase().replace(/\s/g, '')
        } else {
            return ""
        }
    }

    public static getFilters(filters: { [key: string]: any }) {
        return {
            [Op.and]: Object.entries(filters).map(([param, value]) => ({
                param,
                value
            })),
        }
    }

    public static getWhereForPostgreSql(model: any, options: IFindOptions<any, any>): string {
        let _reflect = GetReflectionTypes(model)
        let result = ""
        for (const p of Object.getOwnPropertyNames(options)){
            if(p === Op.and){
                console.log((options as unknown as typeof model)[p])
                const _opt = (options as unknown as typeof model)[p]
                if(_opt){
                    let _finder = _opt.filter(o => {
                        let _f = _reflect?.find(r => r.field == o["param"])
                        if(_f){
                            return { param: o["param"], value: o["value"], dbtype: _f.type}
                        }
                    })
                    if(_finder){
                        _finder = _finder.filter(f => f !== undefined)
                    }
                    console.log(_finder)
                }
            }
        }

        return result
    }
}