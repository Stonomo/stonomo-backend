import { Router } from 'express';

import { Eviction, getEvictionById } from '../models/Eviction.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

var router = Router();

/* GET eviction listing. */
// TODO needs to check :auth
router.get('/:id', authenticateToken, async (req, res) => {
	try {
		const evictionId = req.params.id
		var eviction = await getEvictionById(evictionId);
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Eviction record does not exist' });
	}

});

/* POST - create facility */
// TODO: needs to check :auth
router.post('/', authenticateToken, async (req, res) => {
	try {
		const eviction = new Eviction({
			tenantName: req.body.tenantName,
			tenantPhone: req.body.tenantPhone,
			user: req.body.user,
			reason: req.body.reason,
			details: req.body.details, //TODO: convert to nested document with multiple entries and timestamps for each
			evictedOn: req.body.evictedOn
		});
		await eviction.save();
		res.send(eviction);
	} catch (err) {
		res.status(500);
		res.send({ error: 'Internal Server Error' });
	}
})

/* PATCH - update eviction (admin only) */
// TODO: needs to check :auth
// TODO: add check to ensure eviction.user is defined and matches req.body.user
router.patch('/:id', authenticateToken, async (req, res) => {
	try {
		const evictionId = req.params.id
		var eviction = await getEvictionById(evictionId);

		if (!req.body.user || req.body.user != eviction.user) {
			throw new Error("Invalid form data submitted.")
		}

		if (req.body.tenantName) { eviction.tenantName = req.body.tenantName }
		if (req.body.tenantPhone) { eviction.tenantPhone = req.body.tenantPhone }
		if (req.body.tenantEmail) { eviction.tenantEmail = req.body.tenantEmail }
		if (req.body.reason) { eviction.reason = req.body.reason }
		if (req.body.details) { eviction.details += '\n\n' + req.body.details }
		if (req.body.evictedOn) { eviction.evictedOn = req.body.evictedOn }

		await eviction.save();
		res.send(eviction);
	} catch (err) {
		res.status(404);
		res.send({ error: 'Record not found. ' + err });
	}

});

/* DELETE - remove eviction (admin only) */
// TODO: add :auth check
router.delete('/:id', function (req, res, next) {
	// No-op for now
	res.status(403);
	res.send({ error: 'Forbidden' });
});


export { router };
