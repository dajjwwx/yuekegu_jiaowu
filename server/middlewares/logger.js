const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

function logger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${req.ip}`;
    console.log(log);
    accessLogStream.write(log + '\n');
  });
  
  next();
}

function errorLogger(error, req, res, next) {
  const log = `${new Date().toISOString()} - ERROR - ${req.method} ${req.url} - ${error.message}\n${error.stack}`;
  console.error(log);
  
  const errorLogStream = fs.createWriteStream(
    path.join(logDir, 'error.log'),
    { flags: 'a' }
  );
  errorLogStream.write(log + '\n');
  
  next(error);
}

module.exports = {
  logger,
  errorLogger
};
