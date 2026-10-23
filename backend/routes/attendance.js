const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/attendanceController');

router.use(protect);
router.post('/checkin', c.checkIn);
router.put('/checkout', c.checkOut);
router.get('/today', c.today);
router.get('/my', c.my);
router.get('/', authorize('hr', 'manager'), c.all);

module.exports = router;
