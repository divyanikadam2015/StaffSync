// Run once:  npm run seed   -> creates demo HR, Manager and Employee accounts
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const make = async (data) => {
    let u = await User.findOne({ email: data.email });
    if (!u) { u = await User.create(data); console.log('Created', data.email); }
    else console.log('Exists ', data.email);
    return u;
  };

  const hr = await make({ name: 'Priya HR', email: 'hr@staffsync.com', password: 'Admin@123', role: 'hr', department: 'Human Resources', designation: 'HR Manager', joiningDate: new Date('2022-01-10') });
  const mgr = await make({ name: 'Rahul Manager', email: 'manager@staffsync.com', password: 'Manager@123', role: 'manager', department: 'Engineering', designation: 'Engineering Manager', joiningDate: new Date('2022-03-01') });
  await make({ name: 'Amit Employee', email: 'employee@staffsync.com', password: 'Employee@123', role: 'employee', department: 'Engineering', designation: 'Software Developer', manager: mgr._id, salary: 40000, joiningDate: new Date('2023-06-15') });

  if (!(await Announcement.countDocuments())) {
    await Announcement.create({ title: 'Welcome to StaffSync', content: 'This is your new HR portal. Mark attendance daily and apply for leaves here.', postedBy: hr._id });
  }
  console.log('\nDone. Demo logins:\n hr@staffsync.com / Admin@123\n manager@staffsync.com / Manager@123\n employee@staffsync.com / Employee@123');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
