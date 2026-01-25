package main

import (
	"fmt"
)

func generateRepositoryFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	interfaceRepoContent := fmt.Sprintf(`import { %sEntity, Deleted%sEntity } from '../entities/%s.entity'
import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'

export interface I%sRepository {
    create(%s: %sEntity): Promise<%sEntity>
    findById(id: UniqueEntityId): Promise<%sEntity | null>
    findAll(options?: any): Promise<%sEntity[]>
    update(%s: %sEntity): Promise<%sEntity>
    delete(id: UniqueEntityId): Promise<Deleted%sEntity>
}`, singularCap, singularCap, singular, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/repositories/i.%s.repository.ts", basePath, singular), interfaceRepoContent)
}

func generateDatasourceFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	interfaceDsContent := fmt.Sprintf(`import { %sEntity, Deleted%sEntity } from '../entities/%s.entity'
import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'

export interface I%sDataSource {
    create(%s: %sEntity): Promise<%sEntity>
    findById(id: UniqueEntityId): Promise<%sEntity | null>
    findAll(options?: any): Promise<%sEntity[]>
    update(%s: %sEntity): Promise<%sEntity>
    delete(id: UniqueEntityId): Promise<Deleted%sEntity>
}`, singularCap, singularCap, singular, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/datasources/i.%s.datasource.ts", basePath, singular), interfaceDsContent)
}
