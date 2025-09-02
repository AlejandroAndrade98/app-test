// src/config/api.ts
import { Platform } from 'react-native';

const ANDROID_EMULATOR = 'http://10.0.2.2:4000';
const LOCALHOST = 'http://localhost:4000';

// Usa tu .env cuando estés en dispositivo físico o quieras forzar IP LAN
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? ANDROID_EMULATOR : LOCALHOST);

  export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1';