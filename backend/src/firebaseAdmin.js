// AI-assisted: see docs/AI_LOG.md #17
import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';

// The service account gives full admin access: it only exists on the backend
const serviceAccount = JSON.parse(readFileSync(config.serviceAccountPath, 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
export { FieldValue };