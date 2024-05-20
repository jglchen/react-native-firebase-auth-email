import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth/react-native';
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID } from '@env';

const firebaseConfig = {
    apiKey: API_KEY || process.env.EXPO_PUBLIC_API_KEY,
    authDomain: AUTH_DOMAIN || process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    projectId: PROJECT_ID || process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: STORAGE_BUCKET || process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: APP_ID || process.env.EXPO_PUBLIC_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// initialize auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
