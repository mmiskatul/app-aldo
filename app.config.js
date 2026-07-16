const fs = require('fs');
const { withGradleProperties } = require('@expo/config-plugins');

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

// Config plugin to ensure Gradle uses Java 17, avoiding Kotlin compilation errors with Java 21
const finalConfig = withGradleProperties(config, (config) => {
  config.modResults = config.modResults.map((item) => {
    if (item.key === 'org.gradle.java.home') {
      return { ...item, value: 'C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot' };
    }
    return item;
  });

  const hasJavaHome = config.modResults.some((item) => item.key === 'org.gradle.java.home');
  if (!hasJavaHome) {
    config.modResults.push({
      type: 'property',
      key: 'org.gradle.java.home',
      value: 'C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot',
    });
  }

  return config;
});

module.exports = finalConfig;

