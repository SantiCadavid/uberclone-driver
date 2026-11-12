// AI-assisted: see docs/AI_LOG.md #17
import 'dotenv/config';

const REQUIRED = ['PUBLIC_URL', 'MP_ACCESS_TOKEN', 'FIREBASE_SERVICE_ACCOUNT_PATH'];

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing variables in backend/.env: ${missing.join(', ')}`);
  process.exit(1);
}

// Secrets are read only here and never logged or sent to the app
export const config = {
  port: Number(process.env.PORT ?? 3000),
  publicUrl: process.env.PUBLIC_URL.replace(/\/$/, ''),
  mpAccessToken: process.env.MP_ACCESS_TOKEN,
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
};