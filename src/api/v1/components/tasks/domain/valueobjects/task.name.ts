
import { ValueObject } from "src/core/domain/types/valueobject"
import { Result } from "src/core/domain/types/result"
import { Guard } from "src/core/domain/types/guard"

interface TaskNameProps {
    value: string
}

export class TaskName extends ValueObject<TaskNameProps> {
    get value(): string {
        return this.props.value
    }

    private constructor(props: TaskNameProps) {
        super(props)
    }

    public static create(name: string): Result<TaskName> {
        const guardResult = Guard.againstNullOrUndefined(name, 'name')
        if (!guardResult.succeeded) {
            return Result.fail<TaskName>(guardResult.message)
        } else {
            return Result.ok<TaskName>(new TaskName({ value: name }))
        }
    }
}