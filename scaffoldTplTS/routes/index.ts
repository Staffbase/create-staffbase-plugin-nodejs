import {Router} from 'express';
const router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Staffbase SSO Server'});
});

export default router;
