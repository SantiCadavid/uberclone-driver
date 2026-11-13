// AI-assisted: see docs/AI_LOG.md #25
import { buildDriverDocument } from '../driverDocument';

const personal = {
  profilePhoto: 'file://profile.jpg',
  fullName: 'Ana Pérez',
  documentId: '1234567',
  phone: '3001234567',
  birthDate: new Date(1990, 0, 1),
  gender: 'female',
  email: 'ana@test.com',
  language: 'es',
};
const vehicle = {
  category: 'economy', plate: 'ABC123', brand: 'Renault', model: 'Duster',
  year: '2000', color: 'white', capacity: '4', vehiclePhoto: 'file://vehicle.jpg',
};
const documents = {
  licenseNumber: '1234567890', licensePhoto: 'file://l.jpg', licenseExpiry: new Date(2030, 0, 1),
  soatPhoto: 'file://s.jpg', soatExpiry: new Date(2027, 0, 1),
  techPhoto: 'file://t.jpg', techExpiry: new Date(2027, 5, 1),
  mercadoPagoEmail: 'pagos@test.com', acceptedTerms: true,
};
const BASE = 'https://res.cloudinary.com/demo/image/upload';
const urls = {
  profilePhotoUrl: `${BASE}/p.jpg`,
  vehiclePhotoUrl: `${BASE}/v.jpg`,
  licensePhotoUrl: `${BASE}/l.jpg`,
  soatPhotoUrl: `${BASE}/s.jpg`,
  techPhotoUrl: `${BASE}/t.jpg`,
};

describe('buildDriverDocument with photo URLs', () => {
  test('puts each Cloudinary URL in its field', () => {
    const driver = buildDriverDocument('uid1', personal, vehicle, 'TS', documents, urls);
    expect(driver.profilePhotoUrl).toBe(urls.profilePhotoUrl);
    expect(driver.vehicle.photoUrl).toBe(urls.vehiclePhotoUrl);
    expect(driver.documents.license.photoUrl).toBe(urls.licensePhotoUrl);
    expect(driver.documents.soat.photoUrl).toBe(urls.soatPhotoUrl);
    expect(driver.documents.technicalInspection.photoUrl).toBe(urls.techPhotoUrl);
  });
  test('without URLs every photo stays null and no local path is stored', () => {
    const driver = buildDriverDocument('uid1', personal, vehicle, 'TS', documents);
    expect(driver.profilePhotoUrl).toBeNull();
    expect(driver.vehicle.photoUrl).toBeNull();
    expect(JSON.stringify(driver)).not.toContain('file://');
  });
});