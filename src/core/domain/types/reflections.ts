import { T } from "@faker-js/faker/dist/airline-C5Qwd7_q"
import "reflect-metadata"

// function MaxLength(length: number) {
//     return function (target: any, propertyKey: string) {
//         Reflect.defineMetadata("maxLength", length, target, propertyKey);
//     }
// }

export enum Types {
    ID = "ID",
    String = "String",
    Number = "Number",
    Date = "Date",
    JSON = "JSON"
}

export function ID(target: any, propertyKey: string){
    Reflect.defineMetadata("ID", "Identity", target, propertyKey)
}

export function Type(type: Types){
    return function(target: any, propertyKey: string){
        Reflect.defineMetadata("type", type, target, propertyKey)
    }
}

export interface OptionDefinition {
    short?: string
    type?: typeof String | typeof Boolean | [typeof String] | [typeof Boolean]
}

export const Option = (def: OptionDefinition) => Reflect.metadata(Option, def)

const getOptionMetadata = (ctor: new () => any, prop: string) =>
  Reflect.getMetadata(Option, ctor.prototype, prop) as
    | OptionDefinition
    | undefined

export function GetReflectionTypes(T: new () => any ){
    for (const k of Object.keys(T)) {
        const def = getOptionMetadata(T, k)
        if (!def) continue;
    
        // получаем информацию из типов TypeScript
        const defType =
          def.type ?? Reflect.getMetadata("design:type", T.prototype, k)

        console.log("defType = ", defType)
    }
}