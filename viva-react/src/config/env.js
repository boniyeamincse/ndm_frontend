/**
 * Environment Variable Validation & Configuration Wrapper
 * This file ensures that the application has all necessary keys to function.
 */

const getEnvVar = (key, fallback = '') => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.warn(`[Env Config Warning]: Environment variable ${key} is missing!`);
  }
  return value || fallback;
};

export const ENV = {
  // API Configuration
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3000/api'),
  
  // Service Keys
  GOOGLE_MAPS_KEY: getEnvVar('VITE_GOOGLE_MAPS_KEY'),
  
  // App Info
  APP_NAME: getEnvVar('VITE_APP_NAME', 'NDM Student Movement'),
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development'),
  
  // Helpers
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};

export default ENV;
