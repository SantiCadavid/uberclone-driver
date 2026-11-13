// AI-assisted: see docs/AI_LOG.md #19, #24
import {
  Timestamp,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { HISTORY_CONFIG } from '../config/history';
import { TRIP_STATUS } from '../config/trip';
import { defaultT } from '../i18n';

const toMs = (value) => value?.toMillis?.() ?? null;

// Firestore document -> plain object with millisecond dates (easy to filter and test)
function toTrip(snapshot) {
  const data = snapshot.data({ serverTimestamps: 'estimate' });
  return {
    id: snapshot.id,
    ...data,
    createdAtMs: toMs(data.createdAt),
    completedAtMs: toMs(data.completedAt),
    paidAtMs: toMs(data.paidAt),
  };
}

// One page of finished trips, newest first. "cursor" is the last document of the previous page.
export async function fetchTripHistoryPage({ driverId, range, paymentMethod, cursor }) {
  const constraints = [
    where('driverId', '==', driverId),
    where('status', 'in', HISTORY_CONFIG.statuses),
    ...(paymentMethod ? [where('paymentMethod', '==', paymentMethod)] : []),
    where('completedAt', '>=', Timestamp.fromMillis(range.startMs)),
    where('completedAt', '<=', Timestamp.fromMillis(range.endMs)),
    orderBy('completedAt', 'desc'),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(HISTORY_CONFIG.pageSize),
  ];
  const snapshot = await getDocs(query(collection(db, 'trips'), ...constraints));
  return {
    trips: snapshot.docs.map(toTrip),
    cursor: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === HISTORY_CONFIG.pageSize,
  };
}

// Real-time listener of PAID trips completed since "sinceMs" (data for the earnings screen).
// Returns the unsubscribe function for the useEffect cleanup.
export function subscribeToPaidTrips(driverId, sinceMs, onData, onError) {
  const paidQuery = query(
    collection(db, 'trips'),
    where('driverId', '==', driverId),
    where('status', '==', TRIP_STATUS.paid),
    where('completedAt', '>=', Timestamp.fromMillis(sinceMs)),
    orderBy('completedAt', 'desc'),
  );
  return onSnapshot(paidQuery, (snapshot) => onData(snapshot.docs.map(toTrip)), onError);
}

// Returns a translation key (hooks store it; the screen translates it)
export function getHistoryErrorKey(error) {
  // Only happens until the composite index is created in Firestore
  if (error?.code === 'failed-precondition') return 'history.error.index';
  if (error?.code === 'unavailable' || error?.message === 'timeout') return 'history.error.network';
  return 'history.error.unknown';
}

export function getHistoryErrorMessage(error, t = defaultT) {
  return t(getHistoryErrorKey(error));
}