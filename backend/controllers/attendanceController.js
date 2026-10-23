const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const { todayStr } = require('../utils/date');

exports.checkIn = asyncHandler(async (req, res) => {
  const date = todayStr();
  const existing = await Attendance.findOne({ employee: req.user._id, date });
  if (existing) { res.status(400); throw new Error('You have already checked in today'); }
  res.status(201).json(await Attendance.create({ employee: req.user._id, date, checkIn: new Date(), status: 'present' }));
});

exports.checkOut = asyncHandler(async (req, res) => {
  const rec = await Attendance.findOne({ employee: req.user._id, date: todayStr() });
  if (!rec) { res.status(400); throw new Error('You have not checked in today'); }
  if (rec.checkOut) { res.status(400); throw new Error('You have already checked out today'); }
  rec.checkOut = new Date();
  rec.hours = +((rec.checkOut - rec.checkIn) / 3600000).toFixed(2);
  rec.status = rec.hours >= 4 ? 'present' : 'half-day';
  await rec.save();
  res.json(rec);
});

exports.today = asyncHandler(async (req, res) => {
  res.json(await Attendance.findOne({ employee: req.user._id, date: todayStr() }));
});

exports.my = asyncHandler(async (req, res) => {
  res.json(await Attendance.find({ employee: req.user._id }).sort('-date').limit(60));
});

exports.all = asyncHandler(async (req, res) => {
  const { date, employee } = req.query;
  const filter = {};
  if (date) filter.date = date;
  if (employee) filter.employee = employee;
  if (req.user.role === 'manager') {
    const ids = (await User.find({ manager: req.user._id }).select('_id')).map((u) => u._id);
    filter.employee = employee ? (ids.map(String).includes(employee) ? employee : null) : { $in: ids };
  }
  res.json(await Attendance.find(filter).populate('employee', 'name department').sort('-date').limit(300));
});
