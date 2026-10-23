const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

const FIELDS = ['name', 'email', 'role', 'department', 'designation', 'phone', 'salary', 'joiningDate', 'manager', 'isActive'];

const clean = (body) => {
  const data = {};
  FIELDS.forEach((f) => { if (body[f] !== undefined) data[f] = body[f]; });
  if (data.manager === '') data.manager = null;
  if (data.salary === '') delete data.salary;
  if (data.joiningDate === '') delete data.joiningDate;
  return data;
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.list = asyncHandler(async (req, res) => {
  const { q, role, department } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(escapeRe(q), 'i') }, { email: new RegExp(escapeRe(q), 'i') }];
  if (role) filter.role = role;
  if (department) filter.department = new RegExp(escapeRe(department), 'i');
  res.json(await User.find(filter).populate('manager', 'name').sort('-createdAt'));
});

exports.managers = asyncHandler(async (req, res) => {
  res.json(await User.find({ role: 'manager', isActive: true }).select('name department'));
});

exports.team = asyncHandler(async (req, res) => {
  res.json(await User.find({ manager: req.user._id, isActive: true }).select('-salary'));
});

exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('manager', 'name');
  if (!user) { res.status(404); throw new Error('Employee not found'); }
  res.json(user);
});

exports.create = asyncHandler(async (req, res) => {
  const user = new User({ ...clean(req.body), password: req.body.password });
  await user.save();
  const u = user.toObject();
  delete u.password;
  res.status(201).json(u);
});

exports.update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('Employee not found'); }
  Object.assign(user, clean(req.body));
  if (req.body.password) user.password = req.body.password;
  await user.save();
  const u = user.toObject();
  delete u.password;
  res.json(u);
});

exports.remove = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) { res.status(400); throw new Error('You cannot delete your own account'); }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { res.status(404); throw new Error('Employee not found'); }
  res.json({ message: 'Employee deleted' });
});
