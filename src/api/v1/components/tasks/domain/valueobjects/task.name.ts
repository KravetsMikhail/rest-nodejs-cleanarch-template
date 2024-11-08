
import { ValueObject } from "../../../../../../core/domain/types/valueobject"
import { Result } from "../../../../../../core/domain/types/result"
import { Guard } from "../../../../../../core/domain/types/guard"

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
        const guardResult = Guard.againstNullOrUndefinedOrEmpty(name, 'name')
        if (!guardResult.succeeded) {
            return Result.fail<TaskName, any>(guardResult.message)
        } else {
            return Result.ok<TaskName>(new TaskName({ value: Guard.toClearString(name) }))
        }
    }
}