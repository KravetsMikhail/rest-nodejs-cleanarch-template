import { Router } from 'express'
import { TaskRoutesV1 } from '../../components/tasks/interface/v1/task.routes' 

export class AppRoutes {  
 static get routes(): Router {  
  const router = Router()
  
  router.use('/v1/tasks/', TaskRoutesV1.routes)
  
  return router
 }  
}