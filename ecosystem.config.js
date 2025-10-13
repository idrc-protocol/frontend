// ecosystem.config.js
const fs = require('fs');
const path = require('path');

// Load .env file
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = { NODE_ENV: 'production', PORT: 9000 };

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

module.exports = {
  apps: [{
    name: 'idrc-frontend',
    script: './node_modules/next/dist/bin/next',
    args: 'start -p 9000',
    cwd: '/home/kizovps/idrc/frontend',
    instances: 1,
    exec_mode: 'fork',
    env: env,
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
