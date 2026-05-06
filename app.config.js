const fs = require('fs');

const config = require('./app.json');

const googleServicesFile = './google-services.json';
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (apiUrl) {
  config.expo.extra = {
    ...config.expo.extra,
    apiUrl,
  };
}

if (fs.existsSync(googleServicesFile)) {
  config.expo.android = {
    ...config.expo.android,
    googleServicesFile,
  };
}

module.exports = config;
