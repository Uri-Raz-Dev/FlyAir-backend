import { asyncLocalStorage } from '../../services/als.service.js'
import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { authService } from '../auth/auth.service.js'
import { stayService } from '../stay/stay.service.js'
import { userService } from '../user/user.service.js'
import { orderService } from './order.service.js'



export async function getOrders(req, res) {
    try {
        const orders = await orderService.query(req.query)
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

export async function getOrderById(req, res) {
    try {
        const orderId = req.params.id
        const order = await orderService.getById(orderId)
        res.json(order)
    } catch (err) {
        logger.error('Failed to get order', err)
        res.status(500).send({ err: 'Failed to get order' })
    }
}

export async function addOrder(req, res) {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    if (!loggedinUser) return res.status(401).send({ err: 'You must be logged in' })
    try {
        var order = req.body
        order.buyerId = loggedinUser._id
        order = await orderService.add(order)

        order.buyer = loggedinUser
        order.stay = await stayService.getById(order.stayId)
        const loginToken = authService.getLoginToken(loggedinUser)
        res.cookie('loginToken', loginToken)
        delete order.buyerId
        delete order.stayId

        socketService.emitToUser({ type: 'order-for-you', data: order, userId: order.hostId })

        const fullUser = await userService.getById(loggedinUser._id)
        res.json(order)
    } catch (err) {
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

export async function updateOrder(req, res) {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    try {
        const order = req.body
        const updatedOrder = await orderService.update(order)
        console.log(updatedOrder.buyerId, 'updatedOrder')


        let otherPartyId;
        if (order.buyer._id === loggedinUser._id) {
            otherPartyId = updatedOrder.hostId;
        } else {
            otherPartyId = updatedOrder.buyerId;
        }
        console.log('other party:' + otherPartyId)
        console.log('loggedinUser:' + loggedinUser._id)
        socketService.emitToUser({ type: 'order-status-update', data: updatedOrder, userId: otherPartyId })

        res.json(updatedOrder)
    } catch (err) {
        logger.error('Failed to update order', err)
        res.status(500).send({ err: 'Failed to update order' })
    }
}

export async function deleteOrder(req, res) {
    try {
        const orderId = req.params.id
        const deletedCount = await orderService.remove(orderId)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove order' })
        }
    } catch (err) {
        logger.error('Failed to delete order', err)
        res.status(500).send({ err: 'Failed to delete order' })
    }
}

export async function addOrderMsg(req, res) {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    try {
        const orderId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        }
        const savedMsg = await orderService.addOrderMsg(orderId, msg)
        const order = await orderService.getById(orderId)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update order', err)
        res.status(500).send({ err: 'Failed to update order' })
    }
}

export async function removeOrderMsg(req, res) {
    try {
        const orderId = req.params.id
        const { msgId } = req.params


        const removedMsgId = await orderService.removeOrderMsg(orderId, msgId)
        console.log(removedMsgId, 'removedMsgId')
        res.send(removedMsgId)
    } catch (err) {
        logger.error('Failed to remove order msg', err)
        res.status(500).send({ err: 'Failed to remove order msg' })
    }
}






