import { Router } from 'express';
import { authenticateAdminToken } from '../middleware/authenticateAdminToken.js';
import {
	conditionallyPopulateTestUsers,
	populateSampleEvictions,
	populateSampleUsers,
	populateTestEvictions
} from '../lib/setup.js';
import { populateReasons } from '../models/Reason.js';
var router = Router();

router.get('/test-admin', authenticateAdminToken, async (_req, res) => {
	console.log('Admin route hit');
	res.send('Admin route success');
})

router.get('/populate-reasons', authenticateAdminToken, async (_req, res) => {
	console.log("Populating Reasons List");
	await populateReasons();
	res.send('Reasons updated');
});

router.get('/load-test-evictions', authenticateAdminToken, async (_req, res) => {
	try {
		console.log('Loading test evictions');
		await conditionallyPopulateTestUsers();
		await populateTestEvictions();
		res.send('Test data loaded');
	} catch (err) {
		console.error('Failed to load test evictions');
		console.error(err.message);
		res.status(500).send('Failed to load test evictions');
	}
});

router.get('/load-sample-data', authenticateAdminToken, async (_req, res) => {
	try {
		console.log("Populating Sample Data");
		await populateSampleUsers();
		await populateSampleEvictions(true);
		res.send('Sample loaded');
	} catch (err) {
		console.error('Failed to load sample');
		console.error(err.message);
		res.status(500).send('Failed to load sample');
	}
});

// router.get('/manage', function (req, res) {
//   res.render('pages/manage');
// });

export { router };
