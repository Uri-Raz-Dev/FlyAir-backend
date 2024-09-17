import { ObjectId } from "mongodb"
import { asyncLocalStorage } from "../../services/als.service.js"
import { dbService } from "../../services/db.service.js"
import { logger } from "../../services/logger.service.js"
import { utilService } from "../../services/util.service.js"

export const hostService = {
    query,
    getById,
    remove,
    add,
    update,
    addStayLike,
    addStayReview,
    removeStayLike,
    removeStayReview,
    userStayQuery
}


async function userStayQuery() {
    const store = asyncLocalStorage.getStore()



    const { loggedinUser } = store;

    try {
        const collection = await dbService.getCollection('stay');
        console.log('collection', collection);

        const userId = new ObjectId(loggedinUser._id)
        var hostStays = await collection.aggregate([

            {
                $match: { "host._id": userId },
            },

            {
                $lookup: {
                    from: 'user',
                    localField: "host._id",
                    foreignField: '_id',
                    as: 'hoststay',
                },
            },

            {
                $unwind: '$hoststay'
            },
        ]).toArray();
        hostStays = hostStays.map(stay => {
            delete stay.hoststay.password

            return stay
        })
        // console.log('hostStays', hostStays);

        return hostStays;
    } catch (err) {
        logger.error('Cannot find host stays', err);
        throw err;
    }
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
    if (filterBy.labels && filterBy.labels.length > 0) {
        criteria.labels = { $regex: filterBy.labels[0], $options: 'i' }
    }
    if (filterBy.startDate && filterBy.endDate) {
        criteria.startDate = { $gte: filterBy.startDate }
        criteria.endDate = { $lte: filterBy.endDate }
    }
    // if (filterBy.guests) {
    //     criteria.guests.adults = { $eq: filterBy.guests.adults }
    //     criteria.guests.children = { $eq: filterBy.guests.children }
    //     criteria.guests.infants = { $eq: filterBy.guests.infants }
    //     criteria.guests.pets = { $eq: filterBy.guests.pets }
    // }
    return criteria
}

function _buildUserCriteria(filterBy) {
    const criteria = {}
    if (filterBy.stayId) criteria.stayId = filterBy.stayId
    return criteria
}

