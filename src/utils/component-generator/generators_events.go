package main

import (
	"fmt"
)

func generateEventFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	createdEventContent := fmt.Sprintf(`import { IDomainEvent } from '../../../../../../core/domain/events/domain.event'
import { %sEntity } from '../entities/%s.entity'

export interface I%sCreatedEventProps { %s: %sEntity }

export class %sCreatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public %s: %sEntity

    constructor(props: I%sCreatedEventProps) {
        this.dateTimeOccurred = new Date()
        this.%s = props.%s
    }
}`, singularCap, singular, singularCap, singular, singularCap, singularCap, singular, singularCap, singular, singular)

	writeFile(fmt.Sprintf("%s/domain/events/%s.created.events.ts", basePath, singular), createdEventContent)

	updatedEventContent := fmt.Sprintf(`import { IDomainEvent } from '../../../../../../core/domain/events/domain.event'
import { %sEntity } from '../entities/%s.entity'

export class %sUpdatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public %s: %sEntity

    constructor(%s: %sEntity) {
        this.dateTimeOccurred = new Date()
        this.%s = %s
    }
}`, singularCap, singular, singularCap, singular, singularCap, singular, singularCap, singular)

	writeFile(fmt.Sprintf("%s/domain/events/%s.updated.events.ts", basePath, singular), updatedEventContent)

	deletedEventContent := fmt.Sprintf(`import { IDomainEvent } from '../../../../../../core/domain/events/domain.event'
import { Deleted%sEntity } from '../entities/%s.entity'

export class %sDeletedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public %s: Deleted%sEntity

    constructor(%s: Deleted%sEntity) {
        this.dateTimeOccurred = new Date()
        this.%s = %s
    }
}`, singularCap, singular, singularCap, singular, singularCap, singular, singularCap, singular, singularCap, singular)

	writeFile(fmt.Sprintf("%s/domain/events/%s.deleted.events.ts", basePath, singular), deletedEventContent)
}
