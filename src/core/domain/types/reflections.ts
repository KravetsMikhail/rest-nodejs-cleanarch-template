import "reflect-metadata"

export enum DbTypes {
    ID = "ID",
    String = "String",
    Number = "Number",
    Boolean = "Boolean",
    Date = "Date",
    JSON = "JSON"
}

export class ReflectionData {
    field: string = ""
    type: string = ""
}

export function ID(target: any, propertyKey: string){
    Reflect.defineMetadata("ID", "Identity", target, propertyKey)
}

export function DbType(type: DbTypes){
    return function(target: any, propertyKey: string){
        Reflect.defineMetadata("dataType", type, target, propertyKey)
    }
}

export function GetReflectionTypes(target: any): ReflectionData[] | undefined {
    if(!target || !target.prototype) return
    let result: ReflectionData[] = []
    for (const k of Object.getOwnPropertyNames(target.prototype)){
        let _t = Reflect.getMetadata('dataType', target.prototype, k)
        if(!_t) continue
        let _r = new ReflectionData()
        _r.field = k
        _r.type = _t
        result.push(_r)
    }

    return result
}