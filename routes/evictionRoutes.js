import { Router } from 'express';
import {
	getEvictionByIdLean,
	getEvictionsByUser,
	addEviction,
	addConfirmEviction,
	getConfirmEvictionById,
	getEvictionById,
	deleteEviction,
	getConfirmEvictionByIdLean
} from '../models/Eviction.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import {
	getTokenFromRequest,
	getUseridFromToken
} from '../lib/jwtHelper.js';

let router = Router();

/* GET eviction listings by reporting user. */
router.get('/by-user', authenticateToken, async (req, res) => {
	try {
		const userId = getUseridFromToken(getTokenFromRequest(req))
		const evictions = await getEvictionsByUser(userId);
		res.send(evictions);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* GET eviction listing. */
router.get('/:id', authenticateToken, async (req, res) => {
	try {
		const evictionId = req.params.id
		var eviction = await getEvictionByIdLean(evictionId);
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* GET confirm eviction listing. */
router.get('/confirm/:id', authenticateToken, async (req, res) => {
	try {
		const evictionId = req.params.id
		var eviction = await getConfirmEvictionByIdLean(evictionId);
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* POST - create eviction */
router.post('/', authenticateToken, async (req, res) => {
	try {
		const userid = getUseridFromToken(getTokenFromRequest(req));
		if (req.body.id === '') {
			throw new Error('ID parameter required');
		}
		const submittedEviction = await getConfirmEvictionById(req.body.id);
		const eviction = await addEviction(
			submittedEviction.tenantName,
			submittedEviction.tenantName.toLowerCase(),
			submittedEviction.tenantPhone,
			submittedEviction.tenantEmail.toLowerCase(),
			userid,
			submittedEviction.reason,
			submittedEviction.details,
			submittedEviction.evictedOn
		);
		res.send(eviction);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error ' + err.message });
	}
})

/* POST - create eviction */
router.post('/confirm', authenticateToken, async (req, res) => {
	try {
		const userid = getUseridFromToken(getTokenFromRequest(req));
		const evictionId = await addConfirmEviction(
			req.body.tenantName,
			req.body.tenantPhone,
			req.body.tenantEmail,
			userid,
			req.body.reason,
			req.body.details,
			req.body.evictedOn
		);
		res.send(evictionId);
	} catch (err) {
		console.error(err.message)
		res.status(500);
		res.send({ error: 'Internal Server Error.' });
	}
})

/* PATCH - update eviction (admin only) */
// TODO: add check to ensure eviction.user is defined and matches req.body.user
router.patch('/:id', authenticateToken, async (req, res) => {
	try {
		const evictionId = req.params.id
		const userId = getUseridFromToken(getTokenFromRequest(req));
		let eviction = await getEvictionById(evictionId);

		if (eviction.user._id.toString() !== userId) {
			res.status(403);
			res.send({ error: 'Forbidden' });
		} else {
			if (req.body.details) {
				eviction.details.push({ content: req.body.details });
				await eviction.save();
			}
			res.send(eviction._id);
		}
	} catch (err) {
		res.status(404);
		res.send({ error: 'Record not found. ' + err });
	}

});

/* DELETE - remove eviction */
router.delete('/:id', authenticateToken, async (req, res, next) => {
	try {
		const evictionId = req.params.id;
		const userId = getUseridFromToken(getTokenFromRequest(req));
		const eviction = await getEvictionByIdLean(evictionId);
		if (userId === eviction.user._id.toString()) {
			const deletedId = await deleteEviction(evictionId);
			res.send(deletedId);
		}
		else {
			throw new Error('Only the reporting facility can delete this eviction')
		}
	} catch (err) {
		res.status(403);
		res.send({ error: 'Forbidden. ' + err.message });
	}
});


export { router };
