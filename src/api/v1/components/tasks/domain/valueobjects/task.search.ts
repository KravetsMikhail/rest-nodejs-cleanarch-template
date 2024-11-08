import { ValueObject } from "../../../../../../core/domain/types/valueobject"
import { Helpers } from "../../../../../../core/utils/helpers"

interface ITaskSearchProps {
    value: string
}

export class TaskSearch extends ValueObject<ITaskSearchProps> {
    get value(): string {
        return this.props.value
    }

    private constructor( props: ITaskSearchProps) {
        super(props)        
    }

    public static create( name: string, createdBy: string, updatedBy: string): TaskSearch {
        let _value = `${Helpers.toStrToLowAndRemSpaces(name)}${Helpers.toStrToLowAndRemSpaces(createdBy)}${Helpers.toStrToLowAndRemSpaces(updatedBy)}`
        return new TaskSearch(new TaskSearch({value: _value}))
    }
}