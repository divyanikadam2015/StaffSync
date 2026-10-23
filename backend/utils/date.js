// Returns today's date as YYYY-MM-DD in the configured timezone
exports.todayStr = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: process.env.TIMEZONE || 'Asia/Kolkata' });
