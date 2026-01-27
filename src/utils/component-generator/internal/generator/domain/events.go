package domain

import (
	"fmt"
	"strings"

	"component-generator/internal/model"
)

// GenerateEventFiles generates created/updated/deleted domain events.
func GenerateEventFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := Capitalize(singular)

	var createdEventContent strings.Builder
	createdEventContent.WriteString("import { IDomainEvent } from '../../../../../../core/domain/events/i.domain.event'\n")
	createdEventContent.WriteString(fmt.Sprintf("import { %sEntity } from '../entities/%s.entity'\n\n", singularCap, singular))
	createdEventContent.WriteString(fmt.Sprintf("export interface I%sCreatedEventProps { %s: %sEntity }\n\n", singularCap, singular, singularCap))
	createdEventContent.WriteString(fmt.Sprintf("export class %sCreatedEvent implements IDomainEvent {\n", singularCap))
	createdEventContent.WriteString("    public dateTimeOccurred: Date\n")
	createdEventContent.WriteString(fmt.Sprintf("    public %s: %sEntity\n\n", singular, singularCap))
	createdEventContent.WriteString(fmt.Sprintf("    constructor(props: I%sCreatedEventProps) {\n", singularCap))
	createdEventContent.WriteString("        this.dateTimeOccurred = new Date()\n")
	createdEventContent.WriteString(fmt.Sprintf("        this.%s = props.%s\n", singular, singular))
	createdEventContent.WriteString("    }\n}\n")

	WriteFile(fmt.Sprintf("%s/domain/events/%s.created.events.ts", basePath, singular), createdEventContent.String())

	var updatedEventContent strings.Builder
	updatedEventContent.WriteString("import { IDomainEvent } from '../../../../../../core/domain/events/i.domain.event'\n")
	updatedEventContent.WriteString(fmt.Sprintf("import { %sEntity } from '../entities/%s.entity'\n\n", singularCap, singular))
	updatedEventContent.WriteString(fmt.Sprintf("export class %sUpdatedEvent implements IDomainEvent {\n", singularCap))
	updatedEventContent.WriteString("    public dateTimeOccurred: Date\n")
	updatedEventContent.WriteString(fmt.Sprintf("    public %s: %sEntity\n\n", singular, singularCap))
	updatedEventContent.WriteString(fmt.Sprintf("    constructor(%s: %sEntity) {\n", singular, singularCap))
	updatedEventContent.WriteString("        this.dateTimeOccurred = new Date()\n")
	updatedEventContent.WriteString(fmt.Sprintf("        this.%s = %s\n", singular, singular))
	updatedEventContent.WriteString("    }\n}\n")

	WriteFile(fmt.Sprintf("%s/domain/events/%s.updated.events.ts", basePath, singular), updatedEventContent.String())

	var deletedEventContent strings.Builder
	deletedEventContent.WriteString("import { IDomainEvent } from '../../../../../../core/domain/events/i.domain.event'\n")
	deletedEventContent.WriteString(fmt.Sprintf("import { %sEntity } from '../entities/%s.entity'\n\n", singularCap, singular))
	deletedEventContent.WriteString(fmt.Sprintf("export class %sDeletedEvent implements IDomainEvent {\n", singularCap))
	deletedEventContent.WriteString("    public dateTimeOccurred: Date\n")
	deletedEventContent.WriteString(fmt.Sprintf("    public %s: %sEntity\n\n", singular, singularCap))
	deletedEventContent.WriteString(fmt.Sprintf("    constructor(%s: %sEntity) {\n", singular, singularCap))
	deletedEventContent.WriteString("        this.dateTimeOccurred = new Date()\n")
	deletedEventContent.WriteString(fmt.Sprintf("        this.%s = %s\n", singular, singular))
	deletedEventContent.WriteString("    }\n}\n")

	WriteFile(fmt.Sprintf("%s/domain/events/%s.deleted.events.ts", basePath, singular), deletedEventContent.String())
}
