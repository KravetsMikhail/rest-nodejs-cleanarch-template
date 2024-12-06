import { Op } from "../domain/types/types"

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
}