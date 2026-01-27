package interfaceapi

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/model"
)

// local helpers
func capitalize(s string) string {
	return strings.Title(s)
}

func writeFile(path, content string) {
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		fmt.Printf("Error writing file %s: %v\n", path, err)
	} else {
		fmt.Printf("Created file: %s\n", path)
	}
}

// GenerateInterfaceFiles generates controller and routes with Swagger JSDoc.
func GenerateInterfaceFiles(config model.ComponentConfig, basePath string) {
	singular := config.SingularName
	singularCap := capitalize(singular)
	plural := config.PluralName

	var controllerContent strings.Builder
	controllerContent.WriteString("import { Request, Response } from 'express'\n")
	controllerContent.WriteString(fmt.Sprintf("import { %sEntity } from '../domain/entities/%s.entity'\n\n", singularCap, singular))
	controllerContent.WriteString("/**\n * @swagger\n * tags:\n")
	controllerContent.WriteString(fmt.Sprintf(" *   name: %s\n", plural))
	controllerContent.WriteString(fmt.Sprintf(" *   description: Operations with %s\n */\n", plural))
	controllerContent.WriteString(fmt.Sprintf("export class %sController {\n", singularCap))
	controllerContent.WriteString("    constructor(private readonly repository: any) {}\n\n")
	controllerContent.WriteString("    /**\n     * @swagger\n")
	controllerContent.WriteString(fmt.Sprintf("     * /%s:\n", plural))
	controllerContent.WriteString("     *   get:\n")
	controllerContent.WriteString(fmt.Sprintf("     *     summary: Get list of %s\n", plural))
	controllerContent.WriteString(fmt.Sprintf("     *     tags: [%s]\n", plural))
	controllerContent.WriteString("     *     security:\n     *       - JWT: [read]\n")
	controllerContent.WriteString("     *     parameters:\n")
	controllerContent.WriteString("     *       - in: query\n     *         name: name\n     *         schema:\n     *           type: string\n     *         description: Filter by name\n")
	controllerContent.WriteString(fmt.Sprintf("     *         example: %s1\n", singularCap))
	controllerContent.WriteString("     *       - in: query\n     *         name: offset\n     *         schema:\n     *           type: integer\n     *         description: Offset for pagination\n     *         example: 0\n")
	controllerContent.WriteString("     *       - in: query\n     *         name: limit\n     *         schema:\n     *           type: integer\n     *         description: Limit for pagination\n     *         example: 10\n")
	controllerContent.WriteString("     *     responses:\n     *       200:\n")
	controllerContent.WriteString(fmt.Sprintf("     *         description: List of %s\n", plural))
	controllerContent.WriteString("     *         content:\n     *           application/json:\n     *             schema:\n     *               type: array\n     *               items:\n")
	controllerContent.WriteString(fmt.Sprintf("     *                 $ref: '#/components/schemas/%s'\n", singularCap))
	controllerContent.WriteString("     */\n")
	controllerContent.WriteString(fmt.Sprintf("    public get%s = (_req: Request, res: Response<%sEntity[]>): void => {\n", singularCap, singularCap))
	controllerContent.WriteString("        // TODO: Implement get all logic\n        res.json([])\n    }\n\n")
	controllerContent.WriteString("    /**\n     * @swagger\n")
	controllerContent.WriteString(fmt.Sprintf("     * /%s:\n", plural))
	controllerContent.WriteString("     *   post:\n")
	controllerContent.WriteString(fmt.Sprintf("     *     summary: Create a new %s\n", singularCap))
	controllerContent.WriteString(fmt.Sprintf("     *     tags: [%s]\n", plural))
	controllerContent.WriteString("     *     security:\n     *       - JWT: [write]\n")
	controllerContent.WriteString("     *     requestBody:\n     *       required: true\n     *       content:\n     *         application/json:\n     *           schema:\n")
	controllerContent.WriteString(fmt.Sprintf("     *             $ref: '#/components/schemas/%s'\n", singularCap))
	controllerContent.WriteString(fmt.Sprintf("     *           example:\n     *             name: \"New %s\"\n", singularCap))
	controllerContent.WriteString("     *     responses:\n     *       201:\n")
	controllerContent.WriteString(fmt.Sprintf("     *         description: %s created successfully\n", singularCap))
	controllerContent.WriteString("     *         content:\n     *           application/json:\n     *             schema:\n")
	controllerContent.WriteString(fmt.Sprintf("     *               $ref: '#/components/schemas/%s'\n", singularCap))
	controllerContent.WriteString("     */\n")
	controllerContent.WriteString(fmt.Sprintf("    public create%s = (_req: Request, res: Response<%sEntity>): void => {\n", singularCap, singularCap))
	controllerContent.WriteString(fmt.Sprintf("        // TODO: Implement create logic\n        res.json({} as %sEntity)\n    }\n", singularCap))
	controllerContent.WriteString("\n    /**\n     * @swagger\n")
	controllerContent.WriteString(fmt.Sprintf("     * /%s/{id}:\n", plural))
	controllerContent.WriteString("     *   put:\n")
	controllerContent.WriteString(fmt.Sprintf("     *     summary: Update a %s\n", singularCap))
	controllerContent.WriteString(fmt.Sprintf("     *     tags: [%s]\n", plural))
	controllerContent.WriteString("     *     security:\n     *       - JWT: [write]\n")
	controllerContent.WriteString("     *     parameters:\n")
	controllerContent.WriteString("     *       - in: path\n     *         name: id\n     *         required: true\n     *         schema:\n     *           type: integer\n")
	controllerContent.WriteString("     *     requestBody:\n     *       required: true\n     *       content:\n     *         application/json:\n     *           schema:\n")
	controllerContent.WriteString(fmt.Sprintf("     *             $ref: '#/components/schemas/%s'\n", singularCap))
	controllerContent.WriteString("     *     responses:\n     *       200:\n")
	controllerContent.WriteString(fmt.Sprintf("     *         description: %s updated successfully\n", singularCap))
	controllerContent.WriteString("     *         content:\n     *           application/json:\n     *             schema:\n")
	controllerContent.WriteString(fmt.Sprintf("     *               $ref: '#/components/schemas/%s'\n", singularCap))
	controllerContent.WriteString("     */\n")
	controllerContent.WriteString(fmt.Sprintf("    public update%s = (_req: Request, res: Response<%sEntity>): void => {\n", singularCap, singularCap))
	controllerContent.WriteString(fmt.Sprintf("        // TODO: Implement update logic\n        res.json({} as %sEntity)\n    }\n", singularCap))
	controllerContent.WriteString("\n    /**\n     * @swagger\n")
	controllerContent.WriteString(fmt.Sprintf("     * /%s/{id}:\n", plural))
	controllerContent.WriteString("     *   delete:\n")
	controllerContent.WriteString(fmt.Sprintf("     *     summary: Delete a %s\n", singularCap))
	controllerContent.WriteString(fmt.Sprintf("     *     tags: [%s]\n", plural))
	controllerContent.WriteString("     *     security:\n     *       - JWT: [delete]\n")
	controllerContent.WriteString("     *     parameters:\n")
	controllerContent.WriteString("     *       - in: path\n     *         name: id\n     *         required: true\n     *         schema:\n     *           type: integer\n")
	controllerContent.WriteString("     *     responses:\n     *       204:\n")
	controllerContent.WriteString(fmt.Sprintf("     *         description: %s deleted successfully\n", singularCap))
	controllerContent.WriteString("     */\n")
	controllerContent.WriteString(fmt.Sprintf("    public delete%s = (_req: Request, res: Response): void => {\n", singularCap))
	controllerContent.WriteString("        // TODO: Implement delete logic\n        res.status(204).send()\n    }\n}\n")

	writeFile(fmt.Sprintf("%s/interface/%s.controller.ts", basePath, singular), controllerContent.String())

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
        this.router.put('/:id', this.controller.update%s)
        this.router.delete('/:id', this.controller.delete%s)
    }
}`, singularCap, singular, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap, singularCap)

	writeFile(fmt.Sprintf("%s/interface/%s.routes.ts", basePath, singular), routesContent)
}

