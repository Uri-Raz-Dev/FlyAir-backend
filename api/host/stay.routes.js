import { log } from "../../middlewares/logger.middleware.js"
import { requireAuth } from "../../middlewares/requireAuth.middleware.js"
import express from 'express'
import { addStayLike, addStayReview, getStayById, getStays, getUserStays, removeStay, removeStayLike, removeStayReview, updateStay } from "./stay.controller.js"
export const hostRoutes = express.Router()



hostRoutes.get('/', log, getStays)
hostRoutes.get('/listings', log, getUserStays)
hostRoutes.get('/:id', getStayById)
hostRoutes.post('/', requireAuth, addStayReview)
hostRoutes.post('/', requireAuth, addStayReview)
hostRoutes.put('/:id', requireAuth, updateStay)
hostRoutes.delete('/:id', requireAuth, removeStay)

hostRoutes.post('/:id/review', requireAuth, addStayReview)
hostRoutes.delete('/:id/review/:reviewId', requireAuth, removeStayReview)

hostRoutes.post('/:id/like', requireAuth, addStayLike)
hostRoutes.delete('/:id/like', requireAuth, removeStayLike)

