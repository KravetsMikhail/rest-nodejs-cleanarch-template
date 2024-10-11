import { Router } from 'express'
import { TaskRoutes } from '../../components/tasks/interface/v1/routes' 

export class AppRoutes {  
 static get routes(): Router {  
  const router = Router()
  
  router.use('/v1/tasks/', TaskRoutes.routes)
  
  return router
 }  
}