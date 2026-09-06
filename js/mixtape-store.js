// State Management & Storage Engine (LocalStorage + IndexedDB)
import { PRESET_SONGS } from './preset-songs.js';

const STORAGE_KEY = 'mixtape_for_you_data';
const DB_NAME = 'MixtapeAudioDB';
const DB_STORE = 'audioBlobs';

class MixtapeStore {
  constructor() {
    this.db = null;
    this._initDB();
  }

  _initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (err) => {
        console.warn('IndexedDB unavailable, file storage will be session-only:', err);
        resolve(null);
      };
    });
  }

  async saveAudioBlob(id, blob) {
    if (!this.db) await this._initDB();
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction([DB_STORE], 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.put(blob, id);
        req.onsuccess = () => resolve(id);
        req.onerror = () => reject(req.error);
      } catch (e) {
        reject(e);
      }
    });
  }

  async getAudioBlob(id) {
    if (!this.db) await this._initDB();
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([DB_STORE], 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async deleteAudioBlob(id) {
    if (!this.db) await this._initDB();
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction([DB_STORE], 'readwrite');
        const store = tx.objectStore(DB_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  getDefaultMixtape() {
    return {
      id: 'mixtape-' + Date.now(),
      title: 'Our Special Mixtape ✨',
      sender: 'Your Closest Friend',
      recipient: 'My Favorite Person',
      letter: `Hey there! 

I put together this special mixtape for you. Every track here carries a piece of a memory, a feeling, or a smile we've shared. 

When things get hectic, just put on your headphones, press play, and let the music remind you that someone is always rooting for you and thinking of you. 

Flip over to Side B whenever you need a change of pace. Hope this warms your heart as much as making it did mine! ❤️`,
      theme: 'rose', // rose | neon | lofi | vintage | slate
      sticker: 'heart', // heart | star | flower | sparkle | cat | note
      activeSide: 'A',
      sideA: [
        {
          id: 'trk-1',
          title: PRESET_SONGS[0].title,
          artist: PRESET_SONGS[0].artist,
          note: PRESET_SONGS[0].note,
          duration: PRESET_SONGS[0].duration,
          source: 'preset',
          url: PRESET_SONGS[0].url,
          proceduralKey: PRESET_SONGS[0].proceduralKey
        },
        {
          id: 'trk-2',
          title: PRESET_SONGS[1].title,
          artist: PRESET_SONGS[1].artist,
          note: PRESET_SONGS[1].note,
          duration: PRESET_SONGS[1].duration,
          source: 'preset',
          url: PRESET_SONGS[1].url,
          proceduralKey: PRESET_SONGS[1].proceduralKey
        },
        {
          id: 'trk-3',
          title: PRESET_SONGS[2].title,
          artist: PRESET_SONGS[2].artist,
          note: PRESET_SONGS[2].note,
          duration: PRESET_SONGS[2].duration,
          source: 'preset',
          url: PRESET_SONGS[2].url,
          proceduralKey: PRESET_SONGS[2].proceduralKey
        }
      ],
      sideB: [
        {
          id: 'trk-4',
          title: PRESET_SONGS[3].title,
          artist: PRESET_SONGS[3].artist,
          note: PRESET_SONGS[3].note,
          duration: PRESET_SONGS[3].duration,
          source: 'preset',
          url: PRESET_SONGS[3].url,
          proceduralKey: PRESET_SONGS[3].proceduralKey
        },
        {
          id: 'trk-5',
          title: PRESET_SONGS[4].title,
          artist: PRESET_SONGS[4].artist,
          note: PRESET_SONGS[4].note,
          duration: PRESET_SONGS[4].duration,
          source: 'preset',
          url: PRESET_SONGS[4].url,
          proceduralKey: PRESET_SONGS[4].proceduralKey
        }
      ]
    };
  }

  loadMixtape() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sideA && parsed.sideB) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved mixtape, using defaults:', e);
    }
    const defaultData = this.getDefaultMixtape();
    this.saveMixtape(defaultData);
    return defaultData;
  }

  saveMixtape(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  resetMixtape() {
    const defaultData = this.getDefaultMixtape();
    this.saveMixtape(defaultData);
    return defaultData;
  }
}

export const mixtapeStore = new MixtapeStore();
