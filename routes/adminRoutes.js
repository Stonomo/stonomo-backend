import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { populateSampleUsers } from '../models/User.js';
import { populateSampleEvictions } from '../models/Eviction.js';
var router = Router();

// /* GET home page. */
// router.get('/', authenticateToken, function (req, res) {
//   res.render('pages/index');
// });

router.get('/health-check', authenticateToken, (req, res) => {
  res.send('Up and Running!');
});

router.get('/load-sample', authenticateToken, async (req, res) => {
  try {
    console.log("Populating Sample Data");
    await populateSampleUsers();
    await populateSampleEvictions();
    res.send('Sample loaded');
  } catch (err) {
    console.error('Failed to load sample');
    console.error(err.message);
    res.send('Failed to load sample');
  }
});

router.get('/populate-reasons', authenticateToken, async (req, res) => {
  console.log("Populating Reasons List");
  await populateReasons();
  res.send('Reasons updated');
});

// router.get('/manage', function (req, res) {
//   res.render('pages/manage');
// });


export { router };
