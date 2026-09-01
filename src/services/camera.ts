import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takeCardPhoto(): Promise<string | null> {
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
