const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/leaveController');

router.use(protect);
router.post('/', authorize('employee', 'manager'), c.apply);
router.get('/my', c.my);
router.get('/team', authorize('manager', 'hr'), c.team);
router.put('/:id/status', authorize('manager', 'hr'), c.updateStatus);
router.delete('/:id', c.cancel);

module.exports = router;
