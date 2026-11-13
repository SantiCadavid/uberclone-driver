// AI-assisted: see docs/AI_LOG.md #23
import { translate } from '../../i18n';
import { categoryLabel, paymentMethodLabel } from '../format';
import { getPaymentStatusInfo } from '../paymentStatus';

const tEn = (key, params) => translate('en', key, params);

describe('trip labels in English', () => {
  test('payment status label', () => {
    expect(getPaymentStatusInfo('approved', tEn)).toEqual({ status: 'approved', label: 'Approved', tone: 'success' });
    expect(getPaymentStatusInfo(null, tEn).label).toBe('Not collected');
  });
  test('category label', () => {
    expect(categoryLabel('economy', tEn)).toBe('Economy');
  });
  test('payment method label, Spanish by default and dash when unknown', () => {
    expect(paymentMethodLabel('cash', tEn)).toBe('Cash');
    expect(paymentMethodLabel('cash')).toBe('Efectivo');
    expect(paymentMethodLabel('bitcoin', tEn)).toBe('—');
  });
  test('trip messages with parameters', () => {
    expect(tEn('trip.cashMessage', { fare: '$11.800', commission: '$2.360' })).toBe(
      'Did you receive $11.800 in cash? The $2.360 commission will be deducted from your balance.',
    );
  });
});