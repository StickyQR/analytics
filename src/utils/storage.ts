/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Storage utility for persisting user data
 * Supports localStorage (web), AsyncStorage (React Native), and memory fallback
 */
import { isReactNative, isWeb } from './platform';

export interface StorageAdapter {
  get(key: string): Promise<string | null> | string | null;
  set(key: string, value: string): Promise<void> | void;
  remove(key: string): Promise<void> | void;
}

class LocalStorageAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    try {
      const testKey = '__analytics_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  get(key: string): string | null {
    if (!this.isAvailable()) return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Failed to set localStorage item:', e);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove localStorage item:', e);
    }
  }
}

class AsyncStorageAdapter implements StorageAdapter {
  private asyncStorage: any;

  constructor() {
    // Dynamically import AsyncStorage (React Native)
    try {
      // Try @react-native-async-storage/async-storage (recommended)
      this.asyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (e) {
      console.warn('AsyncStorage not available, falling back to memory storage');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.asyncStorage) return null;
    try {
      return await this.asyncStorage.getItem(key);
    } catch (e) {
      console.warn('Failed to get AsyncStorage item:', e);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.asyncStorage) return;
    try {
      await this.asyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('Failed to set AsyncStorage item:', e);
    }
  }

  async remove(key: string): Promise<void> {
    if (!this.asyncStorage) return;
    try {
      await this.asyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove AsyncStorage item:', e);
    }
  }
}

class CookieAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    return typeof document !== 'undefined' && typeof document.cookie !== 'undefined';
  }

  get(key: string): string | null {
    if (!this.isAvailable()) return null;
    const name = key + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  set(key: string, value: string): void {
    if (!this.isAvailable()) return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
    document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

class MemoryAdapter implements StorageAdapter {
  private store: Map<string, string> = new Map();

  get(key: string): string | null {
    return this.store.get(key) || null;
  }

  set(key: string, value: string): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}

export class Storage {
  private adapter: StorageAdapter;
  private isAsync: boolean;

  constructor() {
    // React Native: Use AsyncStorage
    if (isReactNative()) {
      this.adapter = new AsyncStorageAdapter();
      this.isAsync = true;
    }
    // Web: Try localStorage first, then cookies, fallback to memory
    else if (isWeb()) {
      const localStorageAdapter = new LocalStorageAdapter();
      if (localStorageAdapter.get('__test__') !== undefined) {
        this.adapter = localStorageAdapter;
      } else {
        const cookieAdapter = new CookieAdapter();
        if (typeof document !== 'undefined') {
          this.adapter = cookieAdapter;
        } else {
          this.adapter = new MemoryAdapter();
        }
      }
      this.isAsync = false;
    }
    // Node.js or unknown: Use memory
    else {
      this.adapter = new MemoryAdapter();
      this.isAsync = false;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.adapter.get(key);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as any;
    }
  }

  getSync<T = any>(key: string): T | null {
    if (this.isAsync) {
      throw new Error('Storage is async, use get() instead of getSync()');
    }

    const value = this.adapter.get(key) as string | null;
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as any;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await this.adapter.set(key, serialized);
    } catch (e) {
      console.warn('Failed to serialize value:', e);
    }
  }

  setSync<T = any>(key: string, value: T): void {
    if (this.isAsync) {
      throw new Error('Storage is async, use set() instead of setSync()');
    }

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      this.adapter.set(key, serialized);
    } catch (e) {
      console.warn('Failed to serialize value:', e);
    }
  }

  async remove(key: string): Promise<void> {
    await this.adapter.remove(key);
  }

  removeSync(key: string): void {
    if (this.isAsync) {
      throw new Error('Storage is async, use remove() instead of removeSync()');
    }
    this.adapter.remove(key);
  }
}
