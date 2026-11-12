// AI-assisted: see docs/AI_LOG.md #18
import {
  normalizePaymentStatus,
  getPaymentStatusInfo,
  getCollectionActions,
} from '../paymentStatus';

describe('normalizePaymentStatus', () => {
  test('keeps approved', () => {
    expect(normalizePaymentStatus('approved')).toBe('approved');
  });
  test('maps in_process to pending', () => {
    expect(normalizePaymentStatus('in_process')).toBe('pending');
  });
  test('maps cancelled to rejected', () => {
    expect(normalizePaymentStatus('cancelled')).toBe('rejected');
  });
  test('returns null for unknown or missing values', () => {
    expect(normalizePaymentStatus('xyz')).toBeNull();
    expect(normalizePaymentStatus(undefined)).toBeNull();
  });
});

describe('getPaymentStatusInfo', () => {
  test('shows Efectivo for cash', () => {
    expect(getPaymentStatusInfo('cash').label).toBe('Efectivo');
  });
  test('shows Sin cobrar when there is no status', () => {
    expect(getPaymentStatusInfo(null)).toEqual({ status: null, label: 'Sin cobrar', tone: 'neutral' });
  });
});

describe('getCollectionActions', () => {
  const cardTrip = { status: 'completed', paymentMethod: 'mercadopago', paymentStatus: null };
  const cashTrip = { status: 'completed', paymentMethod: 'cash', paymentStatus: null };

  test('unpaid card trip: only card button', () => {
    expect(getCollectionActions(cardTrip)).toEqual({ canPayWithCard: true, canVerify: false, canMarkCash: false });
  });
  test('rejected card trip: retry card or cash', () => {
    expect(getCollectionActions({ ...cardTrip, paymentStatus: 'rejected' }))
      .toEqual({ canPayWithCard: true, canVerify: false, canMarkCash: true });
  });
  test('pending card trip: only verify', () => {
    expect(getCollectionActions({ ...cardTrip, paymentStatus: 'pending' }))
      .toEqual({ canPayWithCard: false, canVerify: true, canMarkCash: false });
  });
  test('cash trip: only cash button', () => {
    expect(getCollectionActions(cashTrip)).toEqual({ canPayWithCard: false, canVerify: false, canMarkCash: true });
  });
  test('trip not completed: no actions', () => {
    expect(getCollectionActions({ ...cardTrip, status: 'in_progress' }))
      .toEqual({ canPayWithCard: false, canVerify: false, canMarkCash: false });
  });
  test('missing trip: no actions', () => {
    expect(getCollectionActions(null)).toEqual({ canPayWithCard: false, canVerify: false, canMarkCash: false });
  });
});