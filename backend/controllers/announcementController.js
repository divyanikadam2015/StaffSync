const Announcement = require('../models/Announcement');
const { asyncHandler } = require('../middleware/error');

exports.list = asyncHandler(async (req, res) => {
  res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt'));
});

exports.create = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) { res.status(400); throw new Error('Title and content are required'); }
  res.status(201).json(await Announcement.create({ title, content, postedBy: req.user._id }));
});

exports.update = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, content: req.body.content },
    { new: true, runValidators: true }
  );
  if (!a) { res.status(404); throw new Error('Announcement not found'); }
  res.json(a);
});

exports.remove = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) { res.status(404); throw new Error('Announcement not found'); }
  res.json({ message: 'Announcement deleted' });
});
