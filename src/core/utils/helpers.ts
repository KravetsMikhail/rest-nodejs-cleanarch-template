export class Helpers {
    public static toStrToLowAndRemSpaces(value: any): string {
        if(value){
            return value.toString().toLowerCase().replace(/\s/g,'')
        }else{
            return ""
        }
    }
}