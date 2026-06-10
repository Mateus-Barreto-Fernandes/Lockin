import 'dotenv/config';

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'lockin-dev-secret-2026',
  DB_FILE: process.env.DB_FILE || 'lockin.db',
  API_VERSION: 'v1',
};

export default CONFIG;
