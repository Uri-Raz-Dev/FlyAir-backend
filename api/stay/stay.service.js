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
    removeStayReview,
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
        const collection = await dbService.getCollection('stay');


        if (stay.host._id && typeof stay.host._id === 'string') {
            stay.host._id = new ObjectId(stay.host._id);
        }
        console.log(stay.host);

        console.log('Inserting stay with host fullname:', stay.host.fullname)
        await collection.insertOne(stay);
        return stay;
    } catch (err) {
        logger.error('cannot insert stay', err);
        throw err;
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

    function ensureValidGuestNumber  (value)  {
        if (value === null || value === undefined || value === '' || value==='0') {
          return 0;
        }
        const number = Number(value);
        return isNaN(number) ? 0 : number;
    }
    function isGuestsDefault (guests)  {
      return (
        ensureValidGuestNumber(guests.adults) === 0 &&
        ensureValidGuestNumber(guests.children) === 0 &&
        ensureValidGuestNumber(guests.infants) === 0 &&
        ensureValidGuestNumber(guests.pets) === 0
      )
    }
    if(!isGuestsDefault(filterBy.guests)){
        criteria["guests.adults"] = { $eq: ensureValidGuestNumber(filterBy.guests.adults) };
        criteria["guests.children"] = { $eq: ensureValidGuestNumber(filterBy.guests.children) };
        criteria["guests.infants"] = { $eq: ensureValidGuestNumber(filterBy.guests.infants) };
        criteria["guests.pets"] = { $eq: ensureValidGuestNumber(filterBy.guests.pets) };
    }
    
    //   const criteria = {}
      if (filterBy.region) {
          criteria.region = { $regex: filterBy.region, $options: 'i' }
        }
    if (filterBy.label) {
        criteria.type = { $regex: filterBy.label, $options: 'i' }
    }
    
    if (filterBy.startDate && filterBy.endDate) {
        criteria.startDate = { $gte: filterBy.startDate }
        criteria.endDate = { $lte: filterBy.endDate }
    }
    
    // if (+filterBy.guests.adults > 0 || +filterBy.guests.children > 0 ||
    //     +filterBy.guests.infants > 0 || +filterBy.guests.pets > 0) {
            
            // Check if all guest values are 0 or undefined
            


        // }

    return criteria
}

function _buildUserCriteria(filterBy) {
    const criteria = {}
    if (filterBy.stayId) criteria.stayId = filterBy.stayId
    return criteria
}

