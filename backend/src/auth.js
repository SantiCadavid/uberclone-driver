// AI-assisted: see docs/AI_LOG.md #17
import { adminAuth } from './firebaseAdmin.js';

// Only a signed-in driver can create or verify payments: the app sends its Firebase ID token
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'missing-token' });
    return;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'invalid-token' });
  }
}