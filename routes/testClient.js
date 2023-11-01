import { Router } from 'express';
var router = Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.render('pages/index');
});

router.get('/search', function (req, res) {
  res.render('pages/search');
});

router.get('/report', function (req, res) {
  res.render('pages/report');
});

// router.get('/manage', function (req, res) {
//   res.render('pages/manage');
// });


export { router };
