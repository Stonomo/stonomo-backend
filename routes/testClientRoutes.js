import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
var router = Router();

/* GET home page. */
router.get('/', authenticateToken, function (req, res) {
  res.render('pages/index');
});

router.get('/search', authenticateToken, function (req, res) {
  res.render('pages/search');
});

router.get('/report', authenticateToken, function (req, res) {
  res.render('pages/report');
});

// router.get('/manage', function (req, res) {
//   res.render('pages/manage');
// });


export { router };
