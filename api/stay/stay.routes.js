import { log } from "../../middlewares/logger.middleware.js"
import { requireAuth } from "../../middlewares/requireAuth.middleware.js"
import express from 'express'
import { addStay, addStayLike, addStayReview, getStayById, getStays, removeStay, removeStayLike, removeStayReview, updateStay } from "./stay.controller.js"
export const stayRoutes = express.Router()



stayRoutes.get('/', log, getStays)
stayRoutes.get('/:id', getStayById)
stayRoutes.post('/', requireAuth, addStay)

stayRoutes.put('/:id', requireAuth, updateStay)
stayRoutes.delete('/:id', requireAuth, removeStay)

stayRoutes.post('/:id/review', requireAuth, addStayReview)
stayRoutes.delete('/:id/review/:reviewId', requireAuth, removeStayReview)

stayRoutes.post('/:id/like', requireAuth, addStayLike)
stayRoutes.delete('/:id/like', requireAuth, removeStayLike)

