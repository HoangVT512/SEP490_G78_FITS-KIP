// IndexedDB Storage for Guide Management
// Supports storing images as blobs with unlimited size (compared to localStorage)

const DB_NAME = 'FITSKIPGuideDB';
const DB_VERSION = 1;
const STORE_NAME = 'guides';

class GuideStorage {
  constructor() {
    this.db = null;
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject('IndexedDB initialization failed');
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('key', 'key', { unique: true });
        }
      };
    });
  }

  // Ensure DB is initialized
  async ensureDB() {
    if (!this.db) {
      await this.init();
    }
  }

  // Get guide data by role key
  async get(key) {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(key);

      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve({ value: result.value });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject('Error retrieving data from IndexedDB');
      };
    });
  }

  // Set guide data by role key
  async set(key, value) {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject('Error saving data to IndexedDB');
      };
    });
  }

  // Delete guide data by role key
  async delete(key) {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject('Error deleting data from IndexedDB');
      };
    });
  }

  // Get all stored guides
  async getAll() {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        reject('Error retrieving all data from IndexedDB');
      };
    });
  }

  // Clear all guide data
  async clear() {
    await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject('Error clearing IndexedDB');
      };
    });
  }
}

// Create singleton instance
const guideStorage = new GuideStorage();

// Export as window.storage for compatibility with existing code
if (typeof window !== 'undefined') {
  window.storage = guideStorage;
}

export default guideStorage;
