// IndexedDB storage utility for large files (supports multi-gigabyte files with no size limits)

const DB_NAME = 'PageShelfStorage';
const DB_VERSION = 1;
const STORE_NAME = 'shelf_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function saveFileToIndexedDB(id: string, data: Blob | string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn('Error saving to IndexedDB:', req.error);
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('saveFileToIndexedDB fallback error:', err);
    return false;
  }
}

export async function getFileFromIndexedDB(id: string): Promise<Blob | string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('getFileFromIndexedDB error:', err);
    return null;
  }
}

export async function deleteFileFromIndexedDB(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function hasFileInIndexedDB(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(id);

      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
