import "reflect-metadata"

// function MaxLength(length: number) {
//     return function (target: any, propertyKey: string) {
//         Reflect.defineMetadata("maxLength", length, target, propertyKey);
//     }
// }

export enum DbTypes {
    ID = "ID",
    String = "String",
    Number = "Number",
    Boolean = "Boolean",
    Date = "Date",
    JSON = "JSON"
}

export function ID(target: any, propertyKey: string){
    Reflect.defineMetadata("ID", "Identity", target, propertyKey)
}

export function DbType(type: DbTypes){
    return function(target: any, propertyKey: string){
        console.log("target => ", target, " propertyKey => ", propertyKey)
        Reflect.defineMetadata("dataType", type, target, propertyKey)
    }
}

export interface OptionDefinition {
    short?: string
    type?: typeof String | typeof Boolean | [typeof String] | [typeof Boolean]
}

export const Option = (def: OptionDefinition) => Reflect.metadata(Option, def)

const getOptionMetadata = (target: any, prop: string) =>
  Reflect.getMetadata(Option, target, prop) as
    | OptionDefinition
    | undefined

//export function GetReflectionTypes(target: new () => any ){
export function GetReflectionTypes(target: any ){
    console.log( 
        target.constructor.name,
        Reflect.ownKeys(target),
        //Object.getPrototypeOf(target),
        //Object.getOwnPropertyNames(target),
        //Reflect.getPrototypeOf(target)
    )
    for (const k of Object.getOwnPropertyNames(target)){
        console.log("k => ", k, " : type => ",Reflect.getMetadata('dataType', target, k))
        //console.log("type => ",Reflect.getMetadata('dataType', target, 'createdAt'))
    }
    // for (const k of Reflect.ownKeys(target)){
    //     console.log(k, " => ", Reflect.getMetadata("type", target, k))
    //     const def = getOptionMetadata(target, k as string)
    //     console.log(def)
    //     if (!def) continue

    // }
    // for (const k of Object.keys(target)) {
    //     const def = getOptionMetadata(target, k)
    //     console.log(def)
    //     if (!def) continue
    
    //     // получаем информацию из типов TypeScript
    //     const defType =
    //       def.type ?? Reflect.getMetadata("design:type", target, k)

    //     console.log("defType = ", defType)
    // }
}