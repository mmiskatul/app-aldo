const fs = require('fs');

const config = require('./app.json');

const googleServicesFile = './google-services.json';

if (fs.existsSync(googleServicesFile)) {
  config.expo.android = {
    ...config.expo.android,
    googleServicesFile,
  };
}

module.exports = config;
