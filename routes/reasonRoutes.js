import { Router } from 'express';
import { Reason, getReasonById } from '../models/Reason.js';
import { authenticateToken } from '../middleware/authenticateToken.js';
var router = Router();

/* GET reasons listing. */
// TODO: add :auth check
router.get('/', async (req, res) => {
	const reasons = await Reason.find({});
	res.send(reasons);
});

/* GET - get reason by id */
// TODO: add :auth check
router.get('/:id', authenticateToken, async (req, res) => {
	try {
		const reasonId = req.params.id
		var reason = await getReasonById(reasonId);
		res.send(reason);
	} catch {
		res.status(404);
		res.send({ error: 'Reason does not exist' });
	}
});

/* PATCH - update reason (admin only) */
// TODO: add :auth check
router.patch('/:id', authenticateToken, async (req, res) => {
	try {
		const reasonId = req.params.id
		var reason = await getReasonById(reasonId);

		if (req.body.label) {
			reason.label = req.body.label;
		}
		if (req.body.desc) {
			reason.desc = req.body.desc;
		}
		if (req.body.enabled && typeof req.body.enabled == 'boolean') {
			reason.enabled = req.body.enabled;
		}

		await reason.save();
		res.send(reason);
	} catch {
		res.status(404);
		res.send({ error: 'Reason ID not found' });
	}
})

/* POST - add new reason (admin only) */
// TODO: add :auth check
// TODO: add checks for existing reasons with matching labels
router.post('/', authenticateToken, async (req, res) => {
	try {
		const reason = new Reason({
			label: req.body.label,
			desc: req.body.desc,
			enabled: req.body.enabled
		});
		await reason.save();
		res.send(reason);
	} catch {
		res.status(500);
		res.send({ error: 'Internal Server Error' });
	}
});

/* DELETE - delete reason (admin only) */
// TODO: add :auth check
router.delete('/:id', authenticateToken, function (req, res) {
	// No-op for now
	res.status(403);
	res.send({ error: 'Forbidden' });
});

export { router };
