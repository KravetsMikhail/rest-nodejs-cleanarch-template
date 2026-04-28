package interfaceapi

import (
	"fmt"
	"os"
	"strings"

	"component-generator/internal/generator/domain"
	"component-generator/internal/model"
)

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
	singularCap := domain.Capitalize(singular)
	plural := config.PluralName
	pluralCap := domain.Capitalize(plural)

	var controllerContent strings.Builder

	controllerContent.WriteString(fmt.Sprintf(`
import { type NextFunction, type Request, type Response } from 'express'
import { type I%[2]sRepository } from '../domain/repositories/i.%[1]s.repository'
import { type %[2]sEntity } from '../domain/entities/%[1]s.entity'
import { Get%[2]sUseCase, GetOne%[2]sUseCase } from '../usecases/get-%[1]s.usecase'
import { Create%[2]sUseCase } from '../usecases/create-%[1]s.usecase'
import { Delete%[2]sUseCase } from '../usecases/delete-%[1]s.usecase'
import { Update%[2]sUseCase } from '../usecases/update-%[1]s.usecase'
import { CustomRequest } from '../../../../../core/domain/types/custom.request'
import { Helpers } from '../../../../../core/utils/helpers'

//***ВНИМАНИЕ!!!*****************************
//Необходимо руками добавить следующее:
//в src/config/openapi.ts
//import { %[2]sOpenapiSchema } from '../api/v1/components/%[3]s/domain/entities/%[1]s.openapi';
//
//в components: {
//    schemas: {
//        %[1]s: %[2]sOpenapiSchema, <= эту строчку
//    },
//}
//
//в src/api/v1/interface/routes.ts
//import { %[2]sRoutesV1 } from '../components/%[3]s/interface/%[1]s.routes'
//
//router.use('/v1/%[3]s', %[2]sRoutesV1.routes)
//
//*******************************************

type QueryParams = {
    id: number
    created_at_gte: string
    created_at_lte: string
}

type QueryBody = {
    name: string
    search: string
}

/**
 * @swagger
 * tags:
 *   name: %[3]s
 *   description: Operation with %[3]s
 */
export class %[2]sController {
    constructor(private readonly repository: I%[2]sRepository) { }

    /**
     * @swagger
     * /%[3]s:
     *   get:
     *     summary: Get list of %[3]s
     *     tags: [%[3]s]
     *     security:
     *       - JWT: [read]
     *     parameters:
     *       - in: query
     *         name: created_at_gte
     *         schema:
     *           type: string
     *         format: date
     *         description: С даты добавления
     *         example: 2026-01-01
     *       - in: query
     *         name: created_at_lte
     *         schema:
     *           type: string
     *         format: date
     *         description: По дату добавления
     *         example: 2028-01-01
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
     *       - in: query
     *         name: sort
     *         schema:
     *           type: string
     *         description: Sort field
     *         example: name
     *       - in: query
     *         name: order
     *         schema:
     *           type: string
     *           enum: [desc, asc]
     *         description: Sort order
     *         example: desc
     *     responses:
     *       200:
     *         description: List of %[3]s
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/%[1]s'
     *       400:
     *         description: Ошибка
     *         $ref: "#/components/responses/Error400"
     *       401:
     *         description: Ошибка авторизации
     *         $ref: "#/components/responses/Unauthorized"
     *       500:
     *         description: Ошибка сервера
     */
    public get%[4]s = (
        _req: Request<unknown, unknown, unknown, QueryParams>,
        res: Response<%[2]sEntity[]>,
        next: NextFunction
    ): void => {
        let findOptions = Helpers.getFilters(_req.query)

        new Get%[2]sUseCase(this.repository)
            .execute(findOptions)
            .then((result) => {
                if (result.isLeft()) {
                    const error = result.value
                    next(error.errorValue())
                }
                return res.json(result.value.getValue())
            })
            .catch((error) => {
                next(error)
            })
    }

    public getOne%[2]s = (
        _req: Request<any, unknown, unknown, QueryParams>,
        res: Response<%[2]sEntity>,
        next: NextFunction
    ): void => {
        let _id = 0
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            _id = _req.params.id
        }
        else {
            return
        }

        new GetOne%[2]sUseCase(this.repository)
            .execute(_id.toString())
            .then((result) => {
                if (result.isLeft()) {
                    const error = result.value
                    next(error.errorValue())
                }
                return res.json((result as any).value.getValue())
            })
            .catch((error) => {
                next(error)
            })
    }

    /**
     * @swagger
     * /%[3]s:
     *   post:
     *     summary: Create new %[1]s
     *     tags: [%[3]s]
     *     security:
     *       - JWT: [write]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/%[1]s'
     *     responses:
     *       200:
     *         description: %[2]s created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/%[1]s'
     *       201:
     *         description: %[2]s created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/%[1]s'
     *       400:
     *         description: Ошибка
     *         $ref: '#/components/responses/Error400'
     *       401:
     *         description: Ошибка авторизации
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         description: Ошибка сервера
     */
    public create%[2]s = (
        _req: Request<unknown, unknown, QueryBody, QueryParams>,
        res: Response<%[2]sEntity>,
        next: NextFunction
    ): void => {
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new Create%[2]sUseCase(this.repository)
            .execute(_req.body, user)
            .then((result) => {
                if (result.isLeft()) {
                    const error = result.value
                    next(error.errorValue())
                }
                return res.json((result as any).value.getValue())
            })
            .catch((error) => {
                next(error)
            })
    }
    /**
     * @swagger
     * /%[3]s/{id}:
     *   put:
     *     summary: Update %[1]s
     *     tags: [%[3]s]
     *     security:
     *       - JWT: [write]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/%[1]s'
     *     responses:
     *       200:
     *         description: %[2]s updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/%[1]s'
     *       400:
     *         description: Ошибка
     *         $ref: '#/components/responses/Error400'
     *       401:
     *         description: Ошибка авторизации
     *         $ref: '#/components/responses/Unauthorized'
     *       500:
     *         description: Ошибка сервера
     */
    public update%[2]s = (
        _req: Request<any, unknown, QueryBody, QueryParams>,
        res: Response<%[2]sEntity>,
        next: NextFunction
    ): void => {
        let _id = 0
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            _id = _req.params.id
        } else if (_req && _req.query) {
            _id = (_req.query as QueryParams).id
        }
        else {
            return
        }
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new Update%[2]sUseCase(this.repository)
            .execute(_id, _req.body)
            .then((result) => {
                if (result.isLeft()) {
                    const error = result.value
                    next(error.errorValue())
                }
                return res.json((result as any).value.getValue())
            })
            .catch((error) => {
                next(error)
            })
    }
    /**
     * @swagger
     * /%[3]s/{id}:
     *   delete:
     *     summary: Delete %[1]s
     *     tags: [%[3]s]
     *     security:
     *       - JWT: [delete]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *     responses:
     *       204:
     *         description: %[2]s deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/%[1]s"
     *       400:
     *         description: Ошибка
     *         $ref: "#/components/responses/Error400"
     *       401:
     *         description: Ошибка авторизации
     *         $ref: "#/components/responses/Unauthorized"
     *       500:
     *         description: Ошибка сервера
    */
    public delete%[2]s = (
        _req: Request<any, unknown, unknown, QueryParams>,
        res: Response<%[2]sEntity>,
        next: NextFunction
    ): void => {
        let _id = 0
        if (_req && _req.query && _req.params && Object.keys(_req.query).length === 0 && _req.query.constructor === Object) {
            _id = _req.params.id
        } else if (_req && _req.query) {
            _id = (_req.query as QueryParams).id
        }
        else {
            return
        }
        const user = ((_req as unknown) as CustomRequest).payload.token.preferred_username
        new Delete%[2]sUseCase(this.repository)
            .execute(_id)
            .then((result) => {
                if (result.isLeft()) {
                    const error = result.value
                    next(error.errorValue())
                }
                return res.json((result as any).value.getValue())
            })
            .catch((error) => {
                next(error)
            })
    }
}
	`, singular, singularCap, plural, pluralCap))

	writeFile(fmt.Sprintf("%s/interface/%s.controller.ts", basePath, singular), controllerContent.String())

	routesContent := fmt.Sprintf(`import { Router } from 'express'
import { %[2]sController } from './%[1]s.controller'
import { %[2]sRepository } from '../domain/repositories/%[1]s.repository'
import { PostgreSQL%[2]sDataSource } from '../infrastructure/postgresql.datasource'
import { EnvConfig, DataSourceType } from '../../../../../config/env'

export class %[2]sRoutesV1 {
    static get routes(): Router {
        const router = Router()
        const datasource = %[2]sRoutesV1.getDatasource(EnvConfig.defaultDataSource)
        const repository = new %[2]sRepository(datasource)
        const controller = new %[2]sController(repository)

        router.get('', controller.get%[4]s)
		router.get('/:id', controller.getOne%[2]s)
        router.post('/', controller.create%[2]s)
        router.put('/:id', controller.update%[2]s)
        router.delete('/:id', controller.delete%[2]s)

        return router
    }

    private static getDatasource(type: DataSourceType) {
        switch (type) {
            case 'postgres':
                return new PostgreSQL%[2]sDataSource()
            default:
                return new PostgreSQL%[2]sDataSource() // fallback to postgres
        }
    }
}`, singular, singularCap, plural, pluralCap)

	writeFile(fmt.Sprintf("%s/interface/%s.routes.ts", basePath, singular), routesContent)
}
