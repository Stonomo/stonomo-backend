import { Router } from 'express';
var router = Router();

/* GET users listing. */
router.get('/:id', function (req, res, next) {
  res.send('respond with a resource');
});

export { router };
