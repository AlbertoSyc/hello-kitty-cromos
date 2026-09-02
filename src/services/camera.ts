import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Opens the native Android camera and returns the captured image as base64.
 * We explicitly check/request the camera permission before every capture so
 * subsequent photos work correctly after the first one.
 */
export async function takeCardPhoto(): Promise<string | null> {
  const permissions = await Camera.checkPermissions();

  if (permissions.camera !== 'granted') {
    const requested = await Camera.requestPermissions({ permissions: ['camera'] });
    if (requested.camera !== 'granted') {
      throw new Error('Camera permission not granted');
    }
  }

  const photo = await Camera.getPhoto({
    source: CameraSource.Camera,
    resultType: CameraResultType.Base64,
    quality: 75,
    width: 1400,
    correctOrientation: true,
    saveToGallery: false,
  });

  return photo.base64String || null;
}
