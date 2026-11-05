// AI-assisted: see docs/AI_LOG.md #10
import { APPROVAL_STATUS, buildDriverDocument } from '../driverDocument';

const personalData = {
  profilePhoto: 'file:///photo.jpg',
  fullName: '  Santiago Cadavid  ',
  documentId: '1020304050',
  phone: '3001234567',
  birthDate: new Date(2000, 0, 15),
  gender: 'male',
  email: ' Santiago@UberClone.com ',
  language: 'es',
  password: 'clave2026',
  confirmPassword: 'clave2026',
};

const vehicleData = {
  category: 'xl',
  plate: 'abc-123',
  brand: 'Renault',
  model: 'Duster',
  year: '2022',
  color: 'white',
  capacity: '6',
  vehiclePhoto: 'file:///car.jpg',
};

const buildDocument = () => buildDriverDocument('uid-1', personalData, vehicleData, 'TIMESTAMP');

describe('buildDriverDocument', () => {
  test('never stores the password', () => {
    const driver = buildDocument();
    expect(driver).not.toHaveProperty('password');
    expect(driver).not.toHaveProperty('confirmPassword');
    expect(JSON.stringify(driver)).not.toContain('clave2026');
  });

  test('normalizes plate, email and text fields', () => {
    const driver = buildDocument();
    expect(driver.vehicle.plate).toBe('ABC123');
    expect(driver.email).toBe('santiago@uberclone.com');
    expect(driver.fullName).toBe('Santiago Cadavid');
  });

  test('stores year and capacity as numbers', () => {
    const driver = buildDocument();
    expect(driver.vehicle.year).toBe(2022);
    expect(driver.vehicle.capacity).toBe(6);
  });

  test('new drivers start pending approval and not available', () => {
    const driver = buildDocument();
    expect(driver.approvalStatus).toBe(APPROVAL_STATUS.pending);
    expect(driver.isAvailable).toBe(false);
  });
});