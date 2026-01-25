package main

import (
	"fmt"
)

func generateRepositoryFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	interfaceRepoContent := fmt.Sprintf(`import { IRepository } from '../../../../../../core/domain/types/i.repository'
import { type %sEntity } from '../entities/%s.entity'

export interface I%sRepository extends IRepository<%sEntity, any> {
}`, singularCap, singular, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/repositories/i.%s.repository.ts", basePath, singular), interfaceRepoContent)
}

func generateDatasourceFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	interfaceDsContent := fmt.Sprintf(`import { IDataSource } from '../../../../../../core/domain/types/i.datasource'
import { type %sEntity } from '../entities/%s.entity'

export interface I%sDatasource extends IDataSource<%sEntity, any> {
}`, singularCap, singular, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/datasources/i.%s.datasource.ts", basePath, singular), interfaceDsContent)
}
