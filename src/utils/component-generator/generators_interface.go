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

/**
 * @swagger
 * tags:
 *   name: %ss
 *   description: Operations with %ss
 */
export class %sController {
    constructor(private readonly repository: any) {}

    /**
     * @swagger
     * /%ss:
     *   get:
     *     summary: Get list of %ss
     *     tags: [%ss]
     *     security:
     *       - JWT: [read]
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filter by name
     *         example: %s1
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *         description: Offset for pagination
     *         example: 0
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Limit for pagination
     *         example: 10
     *     responses:
     *       200:
     *         description: List of %ss
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/%s'
     */
    public get%s = (_req: Request, res: Response<%sEntity[]>): void => {
        // TODO: Implement get all logic
        res.json([])
    }

    /**
     * @swagger
     * /%ss:
     *   post:
     *     summary: Create a new %s
     *     tags: [%ss]
     *     security:
     *       - JWT: [write]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/%s'
     *           example:
     *             name: "New %s"
     *     responses:
     *       201:
     *         description: %s created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/%s'
     */
    public create%s = (_req: Request, res: Response<%sEntity>): void => {
        // TODO: Implement create logic
        res.json({} as %sEntity)
    }
}`, singularCap, singular, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

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
