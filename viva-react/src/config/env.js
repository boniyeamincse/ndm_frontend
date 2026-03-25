export const getEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is missing`);
  }
  return value;
};

export const API_URL = getEnv('VITE_API_URL');
