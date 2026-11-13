// AI-assisted: see docs/AI_LOG.md #20
import { buildDriverDocument } from '../driverDocument';
import { PRICING } from '../../config/pricing';

const TIMESTAMP = 'SERVER_TIMESTAMP';

const personal = {
  profilePhoto: 'file://profile.jpg',
  fullName: ' Ana Pérez ',
  documentId: '1234567',
  phone: '3001234567',
  birthDate: new Date(1990, 0, 1),
  gender: 'female',
  email: ' ANA@Test.com ',
  language: 'es',
  password: 'Secreta123',
  confirmPassword: 'Secreta123',
};

const vehicle = {
  category: 'economy',
  plate: 'abc 123',
  brand: ' Renault ',
  model: ' Duster ',
  year: '2000', // old vehicle: inspection required
  color: 'white',
  capacity: '4',
  vehiclePhoto: 'file://vehicle.jpg',
};

const documents = {
  licenseNumber: ' 1234567890 ',
  licensePhoto: 'file://license.jpg',
  licenseExpiry: new Date(2030, 0, 1),
  soatPhoto: 'file://soat.jpg',
  soatExpiry: new Date(2027, 0, 1),
  techPhoto: 'file://tech.jpg',
  techExpiry: new Date(2027, 5, 1),
  mercadoPagoEmail: ' Pagos@Test.com ',
  acceptedTerms: true,
};

describe('buildDriverDocument with documents', () => {
  test('without documents the profile has no documents section (previous behavior)', () => {
    expect(buildDriverDocument('uid1', personal, vehicle, TIMESTAMP)).not.toHaveProperty('documents');
  });

  test('cleans the values and saves the accepted commission', () => {
    const { documents: saved } = buildDriverDocument('uid1', personal, vehicle, TIMESTAMP, documents);
    expect(saved.license.number).toBe('1234567890');
    expect(saved.mercadoPagoEmail).toBe('pagos@test.com');
    expect(saved.termsAcceptedAt).toBe(TIMESTAMP);
    expect(saved.acceptedCommissionRate).toBe(PRICING.commissionRate);
  });

  test('a recent vehicle does not need inspection documents', () => {
    const recent = { ...vehicle, year: String(new Date().getFullYear()) };
    const { documents: saved } = buildDriverDocument('uid1', personal, recent, TIMESTAMP, documents);
    expect(saved.technicalInspection).toEqual({ required: false, photoUrl: null, expiresAt: null });
  });

  test('never stores passwords or local photo paths', () => {
    const text = JSON.stringify(buildDriverDocument('uid1', personal, vehicle, TIMESTAMP, documents));
    expect(text).not.toContain('Secreta123');
    expect(text).not.toContain('file://');
  });
});