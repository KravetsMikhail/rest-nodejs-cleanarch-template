package main

import (
	"fmt"
)

func generateInterfaceFiles(config ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	
	controllerContent := fmt.Sprintf(`import { Request, Response } from 'express'
import { %sEntity } from '../domain/entities/%s.entity'
import { Create%sUseCase } from '../usecases/create-%s.usecase'

export class %sController {
    constructor(private readonly repository: any) {}

    public get%s = (_req: Request, res: Response<%sEntity[]>): void => {
        // TODO: Implement get all logic
        res.json([])
    }

    public create%s = (_req: Request, res: Response<%sEntity>): void => {
        // TODO: Implement create logic
        res.json({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/interface/%s.controller.ts", basePath, singular), controllerContent)

	routesContent := fmt.Sprintf(`import { Router } from 'express'
import { %sController } from './%s.controller'

export class %sRoutes {
    public router: Router
    private controller: %sController

    constructor(repository: any) {
        this.router = Router()
        this.controller = new %sController(repository)
        this.initializeRoutes()
    }

    private initializeRoutes(): void {
        this.router.get('/', this.controller.get%s)
        this.router.post('/', this.controller.create%s)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/interface/%s.routes.ts", basePath, singular), routesContent)
}
