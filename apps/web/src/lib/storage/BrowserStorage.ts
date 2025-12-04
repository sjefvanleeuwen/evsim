import type { IStorage } from '../interfaces/IStorage';

export class BrowserStorage implements IStorage {
  private static instance: BrowserStorage;

  private constructor() {}

  public static getInstance(): BrowserStorage {
    if (!BrowserStorage.instance) {
      BrowserStorage.instance = new BrowserStorage();
    }
    return BrowserStorage.instance;
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
