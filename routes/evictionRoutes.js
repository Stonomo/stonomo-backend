import { Router } from 'express';
import {
	getEvictionByIdLean,
	getEvictionsByUser,
	addEviction,
	addConfirmEviction,
	getConfirmEvictionById,
	getEvictionById,
	deleteEviction
} from '../models/Eviction.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
import {
	extractTokenFromAuthHeader,
	getUseridFromToken,
	getUsernameFromToken
} from '../lib/jwtHelper.js';

let router = Router();

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
		var eviction = await getConfirmEvictionById(evictionId);
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* GET eviction listings by reporting user. */
router.post('/by-user', authenticateToken, async (req, res) => {
	try {
		const username = getUsernameFromToken(extractTokenFromAuthHeader(req.headers))
		var evictions = await getEvictionsByUser(username);
		res.send(evictions);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* POST - create eviction */
router.post('/', authenticateToken, async (req, res) => {
	try {
		const userid = getUseridFromToken(extractTokenFromAuthHeader(req.headers));
		const eviction = await addEviction(
			req.body.tenantName,
			req.body.tenantPhone,
			req.body.tenantEmail,
			userid,
			req.body.reason,
			req.body.details, //TODO: convert to nested document with multiple entries and timestamps for each
			req.body.evictedOn
		);
		res.send(eviction);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error' });
	}
})

/* POST - create eviction */
router.post('/confirm/', authenticateToken, async (req, res) => {
	try {
		const userid = getUseridFromToken(
			extractTokenFromAuthHeader(req.headers));
		const evictionId = await addConfirmEviction(
			req.body.tenantName,
			req.body.tenantPhone,
			req.body.tenantEmail,
			userid,
			req.body.reason,
			req.body.details, //TODO: convert to nested document with multiple entries and timestamps for each
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
		var eviction = await getEvictionById(evictionId);

		// TODO: compare username from jwt to username in eviction and reject if mismatched

		// if (req.body.tenantName) { eviction.tenantName = req.body.tenantName }
		// if (req.body.tenantPhone) { eviction.tenantPhone = req.body.tenantPhone }
		// if (req.body.tenantEmail) { eviction.tenantEmail = req.body.tenantEmail }
		// if (req.body.reason) { eviction.reason = req.body.reason }
		if (req.body.details) { eviction.details += '\n\n' + req.body.details }
		// if (req.body.evictedOn) { eviction.evictedOn = req.body.evictedOn }

		await eviction.save();
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Record not found. ' + err });
	}

});

/* DELETE - remove eviction */
router.delete('/:id', authenticateToken, async (req, res, next) => {
	try {
		const evictionId = req.params.id;
		const username = extractUsernameFromAuthHeaderToken(req.headers)
		await deleteEviction(evictionId);
		res.send(getEvictionsByUser(username))
	} catch (err) {
		res.status(501);
		res.send({ error: 'Forbidden' });
	}
});


export { router };
