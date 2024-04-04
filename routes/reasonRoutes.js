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

export { router };
