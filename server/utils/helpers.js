const crypto = require('crypto');

function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function generateStudentNo(year = new Date().getFullYear()) {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${random}`;
}

function generateTeacherNo() {
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `T${random}`;
}

function generateEnrollNo(year = new Date().getFullYear()) {
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `E${year}${random}`;
}

function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

function parseQuery(query) {
  const result = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === 'true') result[key] = true;
    else if (value === 'false') result[key] = false;
    else if (!isNaN(value) && value !== '') result[key] = Number(value);
    else result[key] = value;
  }
  return result;
}

function paginate(page = 1, pageSize = 10) {
  const limit = parseInt(pageSize);
  const offset = (parseInt(page) - 1) * limit;
  return { limit, offset };
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function calculateGPA(scores) {
  if (!scores || scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + score, 0);
  return (total / scores.length).toFixed(2);
}

function getGradeLevel(age) {
  if (age <= 12) return 1;
  if (age <= 13) return 2;
  if (age <= 14) return 3;
  if (age <= 15) return 4;
  if (age <= 16) return 5;
  return 6;
}

function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function maskIdCard(idCard) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.slice(0, 4) + '**********' + idCard.slice(-4);
}

module.exports = {
  generateRandomString,
  hashString,
  generateStudentNo,
  generateTeacherNo,
  generateEnrollNo,
  formatDate,
  parseQuery,
  paginate,
  calculateAge,
  calculateGPA,
  getGradeLevel,
  maskPhone,
  maskIdCard
};
