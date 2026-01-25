package main

import (
	"fmt"
	"strings"
)

func generateRepositoryFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	interfaceRepoContent := fmt.Sprintf(`import { IRepository } from '../../../../../../core/domain/types/i.repository'
import { type %sEntity } from '../entities/%s.entity'

export interface I%sRepository extends IRepository<%sEntity, any> {
}`, singularCap, singular, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/domain/repositories/i.%s.repository.ts", basePath, singular), interfaceRepoContent)

	var repoContent strings.Builder
	repoContent.WriteString("import { ID, IFindOptions } from '../../../../../core/domain/types/types'\n")
	repoContent.WriteString(fmt.Sprintf("import { type I%sDatasource } from '../datasources/i.%s.datasource'\n", singularCap, singular))
	repoContent.WriteString(fmt.Sprintf("import { %sEntity } from '../entities/%s.entity'\n", singularCap, singular))
	repoContent.WriteString(fmt.Sprintf("import { type I%sRepository } from './i.%s.repository'\n\n", singularCap, singular))
	repoContent.WriteString(fmt.Sprintf("export class %sRepository implements I%sRepository {\n", singularCap, singularCap))
	repoContent.WriteString(fmt.Sprintf("    constructor(private readonly datasource: I%sDatasource) { }\n\n", singularCap))
	repoContent.WriteString(fmt.Sprintf("    async create(value: Partial<%sEntity>): Promise<%sEntity> {\n        return await this.datasource.create(value)\n    }\n", singularCap, singularCap))
	repoContent.WriteString(fmt.Sprintf("    createMany(values: Partial<%sEntity>[]): Promise<%sEntity[]> {\n        throw new Error('Method not implemented.')\n    }\n", singularCap, singularCap))
	repoContent.WriteString(fmt.Sprintf("    async update(id: ID, newValue: Partial<%sEntity>): Promise<%sEntity> {\n        return await this.datasource.update(id, newValue)\n    }\n", singularCap, singularCap))
	repoContent.WriteString("    async delete(id: ID): Promise<any> {\n        return await this.datasource.delete(id)\n    }\n")
	repoContent.WriteString(fmt.Sprintf("    async find(options?: IFindOptions<%sEntity, any> | undefined): Promise<%sEntity[]> {\n        return await this.datasource.find(options)\n    }\n", singularCap, singularCap))
	repoContent.WriteString(fmt.Sprintf("    async findOne(id: ID | Partial<%sEntity>, options?: IFindOptions<%sEntity, any> | undefined): Promise<%sEntity> {\n        return await this.datasource.findOne(id)\n    }\n", singularCap, singularCap, singularCap))
	repoContent.WriteString(fmt.Sprintf("    exist(id: ID | Partial<%sEntity>): Promise<boolean> {\n        throw new Error('Method not implemented.')\n    }\n}\n", singularCap))

	writeFile(fmt.Sprintf("%s/domain/repositories/%s.repository.ts", basePath, singular), repoContent.String())
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
