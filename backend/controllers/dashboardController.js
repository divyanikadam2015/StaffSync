const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const { asyncHandler } = require('../middleware/error');
const { todayStr } = require('../utils/date');

exports.stats = asyncHandler(async (req, res) => {
  const u = req.user;
  const today = todayStr();
  const month = today.slice(0, 7);
  const announcements = await Announcement.countDocuments();

  if (u.role === 'hr') {
    const [employees, pendingLeaves, presentToday, departments] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ date: today }),
      User.distinct('department'),
    ]);
    return res.json({ cards: [
      { label: 'Total Employees', value: employees, icon: 'people', color: 'primary' },
      { label: 'Present Today', value: presentToday, icon: 'person-check', color: 'success' },
      { label: 'Pending Leaves', value: pendingLeaves, icon: 'hourglass-split', color: 'warning' },
      { label: 'Departments', value: departments.filter(Boolean).length, icon: 'building', color: 'info' },
      { label: 'Announcements', value: announcements, icon: 'megaphone', color: 'secondary' },
    ]});
  }

  if (u.role === 'manager') {
    const ids = (await User.find({ manager: u._id }).select('_id')).map((x) => x._id);
    const [pending, presentToday, trainings] = await Promise.all([
      Leave.countDocuments({ employee: { $in: ids }, status: 'pending' }),
      Attendance.countDocuments({ employee: { $in: ids }, date: today }),
      Training.countDocuments({ createdBy: u._id }),
    ]);
    return res.json({ cards: [
      { label: 'Team Size', value: ids.length, icon: 'people', color: 'primary' },
      { label: 'Team Present Today', value: presentToday, icon: 'person-check', color: 'success' },
      { label: 'Pending Leave Requests', value: pending, icon: 'hourglass-split', color: 'warning' },
      { label: 'Trainings Created', value: trainings, icon: 'mortarboard', color: 'info' },
      { label: 'Announcements', value: announcements, icon: 'megaphone', color: 'secondary' },
    ]});
  }

  const [pending, approved, daysPresent, trainings] = await Promise.all([
    Leave.countDocuments({ employee: u._id, status: 'pending' }),
    Leave.countDocuments({ employee: u._id, status: 'approved' }),
    Attendance.countDocuments({ employee: u._id, date: new RegExp('^' + month) }),
    Training.countDocuments({ participants: u._id }),
  ]);
  res.json({ cards: [
    { label: 'Days Present (this month)', value: daysPresent, icon: 'calendar-check', color: 'success' },
    { label: 'Pending Leaves', value: pending, icon: 'hourglass-split', color: 'warning' },
    { label: 'Approved Leaves', value: approved, icon: 'check-circle', color: 'primary' },
    { label: 'My Trainings', value: trainings, icon: 'mortarboard', color: 'info' },
    { label: 'Announcements', value: announcements, icon: 'megaphone', color: 'secondary' },
  ]});
});
