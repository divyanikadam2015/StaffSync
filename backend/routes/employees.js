const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/employeeController');

router.use(protect);
router.get('/team', authorize('manager'), c.team);
router.get('/managers', authorize('hr'), c.managers);
router.route('/').get(authorize('hr'), c.list).post(authorize('hr'), c.create);
router.route('/:id').get(authorize('hr'), c.getOne).put(authorize('hr'), c.update).delete(authorize('hr'), c.remove);

module.exports = router;
