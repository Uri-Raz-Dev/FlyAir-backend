import { ObjectId } from "mongodb"
import { asyncLocalStorage } from "../../services/als.service.js"
import { dbService } from "../../services/db.service.js"
import { logger } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"

export const stayService = {
    query,
    getById,
    remove,
    add,
    update,
    addStayLike,
    addStayReview,
    removeStayLike,
    removeStayReview
}


async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        console.log('criteria', criteria)
        const collection = await dbService.getCollection('stay')
        var stays = await collection.find(criteria).toArray()
        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = collection.findOne({ _id: new ObjectId(stayId) })
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: new ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
    try {
        const stayToSave = {
            ...stay,
        }

        console.log(stayToSave)
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stay._id) }, { $set: stayToSave })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stay._id}`, err)
        throw err
    }
}

async function addStayReview(stayId, review) {
    try {
        review.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $push: { reviews: review } })
        return review
    } catch (err) {
        logger.error(`cannot add stay review ${stayId}`, err)
        throw err
    }
}

async function removeStayReview(stayId, reviewId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $pull: { reviews: { id: reviewId } } })
        return reviewId
    } catch (err) {
        logger.error(`cannot remove stay review ${stayId}`, err)
        throw err
    }
}

async function addStayLike(stayId) {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $push: { likedByUsers: { _id: new ObjectId(loggedinUser._id), fullname: loggedinUser.fullname, imgUrl: loggedinUser.imgUrl } } })
        return loggedinUser
    } catch (err) {
        logger.error(`cannot add like ${stayId}`, err)
        throw err
    }
}

async function removeStayLike(stayId) {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: new ObjectId(stayId) }, { $pull: { likedByUsers: { _id: new ObjectId(loggedinUser._id) } } })
        return loggedinUser
    } catch (err) {
        logger.error(`cannot remove like ${stayId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.region) {
        criteria.region = { $regex: filterBy.region, $options: 'i' }
    }
    if (filterBy.startDate && filterBy.endDate) {
        criteria.startDate = { $gte: filterBy.startDate }
        criteria.endDate = { $lte: filterBy.endDate }
    }
    return criteria
}


