const fs = require('fs');

const config = require('./app.json');

const googleServicesFile = './google-services.json';
const DEFAULT_API_URL = 'https://ristoai.onrender.com';
const configuredApiUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  config.expo?.extra?.apiUrl?.trim() ||
  DEFAULT_API_URL;

config.expo.extra = {
  ...config.expo.extra,
  apiUrl: configuredApiUrl,
};

if (fs.existsSync(googleServicesFile)) {
  config.expo.android = {
    ...config.expo.android,
    googleServicesFile,
  };
}

module.exports = config;
