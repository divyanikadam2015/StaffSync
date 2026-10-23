const Training = require('../models/Training');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

const POP = [{ path: 'createdBy', select: 'name' }, { path: 'participants', select: 'name department' }];

exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'manager') filter.createdBy = req.user._id;
  if (req.user.role === 'employee') filter.participants = req.user._id;
  res.json(await Training.find(filter).populate(POP).sort('-startDate'));
});

const checkTeam = async (manager, participants = []) => {
  const team = (await User.find({ manager: manager._id }).select('_id')).map((u) => String(u._id));
  return participants.every((p) => team.includes(String(p)));
};

exports.create = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, participants = [] } = req.body;
  if (!title || !startDate || !endDate) { res.status(400); throw new Error('Title, start date and end date are required'); }
  if (endDate < startDate) { res.status(400); throw new Error('End date cannot be before start date'); }
  if (!(await checkTeam(req.user, participants))) { res.status(403); throw new Error('You can only add members of your own team'); }
  res.status(201).json(await Training.create({ title, description, startDate, endDate, participants, createdBy: req.user._id }));
});

exports.update = asyncHandler(async (req, res) => {
  const t = await Training.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!t) { res.status(404); throw new Error('Training not found'); }
  const { title, description, startDate, endDate, participants } = req.body;
  if (participants && !(await checkTeam(req.user, participants))) { res.status(403); throw new Error('You can only add members of your own team'); }
  Object.assign(t, { title, description, startDate, endDate, participants });
  await t.save();
  res.json(t);
});

exports.remove = asyncHandler(async (req, res) => {
  const t = await Training.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
  if (!t) { res.status(404); throw new Error('Training not found'); }
  res.json({ message: 'Training deleted' });
});
