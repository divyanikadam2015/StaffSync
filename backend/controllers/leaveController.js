const Leave = require('../models/Leave');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');
const { todayStr } = require('../utils/date');

exports.apply = asyncHandler(async (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  if (!type || !fromDate || !toDate || !reason) { res.status(400); throw new Error('All fields are required'); }
  if (toDate < fromDate) { res.status(400); throw new Error('To date cannot be before from date'); }
  if (fromDate < todayStr()) { res.status(400); throw new Error('Cannot apply leave for past dates'); }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  const overlap = await Leave.findOne({
    employee: req.user._id,
    status: { $in: ['pending', 'approved'] },
    fromDate: { $lte: to },
    toDate: { $gte: from },
  });
  if (overlap) { res.status(400); throw new Error('You already have a leave request overlapping these dates'); }

  const days = Math.round((to - from) / 86400000) + 1;
  const leave = await Leave.create({ employee: req.user._id, type, fromDate: from, toDate: to, days, reason });
  res.status(201).json(leave);
});

exports.my = asyncHandler(async (req, res) => {
  res.json(await Leave.find({ employee: req.user._id }).populate('reviewedBy', 'name').sort('-createdAt'));
});

exports.team = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'manager') {
    const ids = (await User.find({ manager: req.user._id }).select('_id')).map((u) => u._id);
    filter.employee = { $in: ids };
  }
  if (req.query.status) filter.status = req.query.status;
  res.json(
    await Leave.find(filter).populate('employee', 'name department role').populate('reviewedBy', 'name').sort('-createdAt')
  );
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['approved', 'rejected'].includes(status)) { res.status(400); throw new Error('Status must be approved or rejected'); }
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) { res.status(404); throw new Error('Leave not found'); }
  if (leave.status !== 'pending') { res.status(400); throw new Error('This request was already reviewed'); }
  if (String(leave.employee._id) === String(req.user._id)) { res.status(403); throw new Error('You cannot review your own leave'); }
  if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id)) {
    res.status(403); throw new Error('You can only review leaves of your own team');
  }
  leave.status = status;
  leave.remarks = remarks;
  leave.reviewedBy = req.user._id;
  await leave.save();
  res.json(leave);
});

exports.cancel = asyncHandler(async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
  if (!leave) { res.status(404); throw new Error('Leave not found'); }
  if (leave.status !== 'pending') { res.status(400); throw new Error('Only pending leaves can be cancelled'); }
  await leave.deleteOne();
  res.json({ message: 'Leave cancelled' });
});
