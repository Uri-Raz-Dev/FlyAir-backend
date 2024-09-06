import { log } from '../../middlewares/logger.middleware.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { addOrder, addOrderMsg, deleteOrder, getOrders, removeOrderMsg, updateOrder } from './order.controller.js'
import express from 'express'

export const orderRoutes = express.Router()


orderRoutes.get('/', log, getOrders)
orderRoutes.post('/', log, requireAuth, addOrder)
orderRoutes.put('/:id', log, requireAuth, updateOrder)
orderRoutes.delete('/:id', requireAuth, deleteOrder)

orderRoutes.post('/:id/msg', requireAuth, addOrderMsg)
orderRoutes.delete('/:id/msg/:msgId', requireAuth, removeOrderMsg)
