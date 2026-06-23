// utils/storage.ts
// expo-secure-store has no web implementation — calling it on web throws
// synchronously, which breaks every request that reads a token before
// it's even sent. This shim picks the right backend per platform.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore — e.g. private browsing mode
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = { getItem, setItem, deleteItem };
