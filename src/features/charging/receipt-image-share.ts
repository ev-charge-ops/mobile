import * as Sharing from 'expo-sharing';
import { PixelRatio, Platform, type View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';

import { SHARE_CARD_WIDTH } from '@/features/charging/components/receipt-share-card';

export const SHARE_IMAGE_PIXEL_RATIO = 3;

let lastCaptureUri: string | null = null;

function toFileUri(uri: string) {
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

function getCaptureSize(height: number) {
  const scale = Platform.OS === 'ios' ? PixelRatio.get() : 1;
  return {
    width: (SHARE_CARD_WIDTH * SHARE_IMAGE_PIXEL_RATIO) / scale,
    height: (height * SHARE_IMAGE_PIXEL_RATIO) / scale,
  };
}

export async function captureReceiptImage(view: View, height: number) {
  if (lastCaptureUri) {
    releaseCapture(lastCaptureUri);
    lastCaptureUri = null;
  }
  const uri = await captureRef(view, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    ...(height > 0 ? getCaptureSize(height) : {}),
  });
  lastCaptureUri = uri;
  return toFileUri(uri);
}

export async function shareReceiptImage(view: View | null, height: number) {
  if (!view || !(await Sharing.isAvailableAsync())) return false;

  let uri: string;
  try {
    uri = await captureReceiptImage(view, height);
  } catch {
    return false;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'image/png',
    dialogTitle: 'Compartilhar recibo',
    UTI: 'public.png',
  });
  return true;
}
