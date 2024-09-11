
import { logger } from '../../services/logger.service.js'
import { stayService } from './stay.service.js'

export async function getStays(req, res) {
    const filterBy = req.query
    try {
        logger.debug('Getting Stays')
        console.log('filterBy', filterBy)
        const stays = await stayService.query(filterBy)
        res.json(stays)
    } catch (err) {
        logger.error('Failed to get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}

export async function getStayById(req, res) {
    try {
        const stayId = req.params.id
        const stay = await stayService.getById(stayId)
        res.json(stay)
    } catch (err) {
        logger.error('Failed to get stay', err)
        res.status(500).send({ err: 'Failed to get stay' })
    }
}

// export async function addStay(req, res) {
//     const { loggedinUser } = req

//     try {
//         const stay = req.body
//         stay.host = loggedinUser
//         const addedStay = await stayService.add(stay)

//         // if (loggedinUser._id && !loggedinUser.isOwner) {
//         //     loggedinUser.isOwner = true
//         //     await userService.update(loggedinUser)
//         // }
//         res.json(addedStay)
//     } catch (err) {
//         logger.error('Failed to add stay', err)
//         res.status(500).send({ err: 'Failed to add stay' })
//     }
// }

export async function addStay(req, res) {
    const { loggedinUser } = req;

    // בדיקה האם המשתמש המחובר קיים
    if (!loggedinUser) {
        return res.status(401).send({ err: 'User not logged in' });
    }

    try {
        const stay = req.body;

        // לוגים כדי לעקוב אחר הערכים שנשלחים לשרת
        console.log('Received stay data:', stay);

        // וודא שהנתונים נשלחים בצורה תקינה (כולל שדות חובה)
        if (!stay.name || !stay.price || !stay.imgUrl || !stay.street) {
            return res.status(400).send({ err: 'Missing required fields' });
        }

        // הוספת המשתמש המחובר כשדה host של הנכס
        stay.host = {
            _id: loggedinUser._id,
            fullname: loggedinUser.name,
            // imgUrl: loggedinUser.imgUrl
        };

        // לוג נוסף למעקב אחרי הערכים המעודכנים
        console.log('Stay with host:', stay);

        const addedStay = await stayService.add(stay);

        res.json(addedStay);
    } catch (err) {
        // לוג במידה ויש שגיאה
        console.error('Failed to add stay', err);
        res.status(500).send({ err: 'Failed to add stay' });
    }
}


export async function updateStay(req, res) {
    try {
        const stay = req.body
        const updatedStay = await stayService.update(stay)
        res.json(updatedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(500).send({ err: 'Failed to update stay' })

    }
}

export async function removeStay(req, res) {
    try {
        const stayId = req.params.id
        const removedId = await stayService.remove(stayId)
        res.json(removedId)
    } catch (err) {
        logger.error('Failed to remove stay', err)
        res.status(500).send({ err: 'Failed to remove stay' })
    }
}

export async function addStayReview(req, res) {
    const { loggedinUser } = req
    try {
        const stayId = req.body.id
        const review = {
            txt: req.body.review.txt,
            rate: req.body.review.rate,
            by: loggedinUser
        }
        const addedReview = await stayService.addStayReview(stayId, review)
        res.json(addedReview)
    } catch (err) {
        logger.error('Failed to add stay review', err)
        res.status(500).send({ err: 'Failed to add stay review' })
    }
}

export async function removeStayReview(req, res) {
    try {
        const stayId = req.body.id
        const { reviewId } = req.params
        const removedReviewId = await stayService.removeStayReview(stayId, reviewId)
        res.send(removedReviewId)
    } catch (err) {
        logger.error('Failed to remove stay review', err)
        res.status(500).send({ err: 'Failed to remove stay review' })
    }
}

export async function addStayLike(req, res) {
    try {
        const stayId = req.params.id
        const addedLike = await stayService.addStayLike(stayId)
        res.json(addedLike)
    } catch (err) {
        logger.error('Failed to add stay like', err)
        res.status(500).send({ err: 'Failed to add stay like' })
    }
}

export async function removeStayLike(req, res) {
    try {
        const stayId = req.params.id
        const removedLike = await stayService.removeStayLike(stayId)
        res.json(removedLike)
    } catch (err) {
        logger.error('Failed to remove stay like', err)
        res.status(500).send({ err: 'Failed to remove stay like' })
    }
}



