import { ValueObject } from "src/core/domain/types/valueobject"

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
        let _value = `${name?.toLowerCase()}${createdBy?.toLowerCase()}${updatedBy?.toLowerCase()}`
        return new TaskSearch(new TaskSearch({value: _value}))
    }
}