// AI-assisted: see docs/AI_LOG.md #25
import { collectRegistrationPhotos, getImageFileInfo } from '../uploadHelpers';

describe('getImageFileInfo', () => {
  test('detects PNG ignoring upper case', () => {
    expect(getImageFileInfo('file:///photos/IMG_1.PNG')).toEqual({ type: 'image/png', name: 'photo.png' });
  });
  test('keeps jpeg and falls back to JPEG for unknown files', () => {
    expect(getImageFileInfo('file:///a/b.jpeg')).toEqual({ type: 'image/jpeg', name: 'photo.jpeg' });
    expect(getImageFileInfo('file:///a/no-extension')).toEqual({ type: 'image/jpeg', name: 'photo.jpg' });
  });
});

describe('collectRegistrationPhotos', () => {
  const personal = { profilePhoto: 'file://p.jpg' };
  const vehicle = { vehiclePhoto: 'file://v.jpg' };
  const documents = { licensePhoto: 'file://l.jpg', soatPhoto: 'file://s.jpg', techPhoto: 'file://t.jpg' };

  test('5 photos when the inspection applies', () => {
    expect(collectRegistrationPhotos(personal, vehicle, documents, true).map((item) => item.key)).toEqual([
      'profilePhotoUrl',
      'vehiclePhotoUrl',
      'licensePhotoUrl',
      'soatPhotoUrl',
      'techPhotoUrl',
    ]);
  });
  test('the inspection photo is skipped when it does not apply, and missing photos are skipped', () => {
    const items = collectRegistrationPhotos(personal, { vehiclePhoto: null }, documents, false);
    expect(items.map((item) => item.key)).toEqual(['profilePhotoUrl', 'licensePhotoUrl', 'soatPhotoUrl']);
  });
});