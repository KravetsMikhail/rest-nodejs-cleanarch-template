
import { Entity } from "../../../../../../core/domain/types/entity"
import { UniqueEntityId } from "../../../../../../core/domain/types/uniqueentityid"

export class UserId extends Entity<any> {

  get id (): UniqueEntityId {
    return this._id
  }

  private constructor (id?: UniqueEntityId) {
    super(null, id)
  }
}