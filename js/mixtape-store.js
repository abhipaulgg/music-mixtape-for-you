// State Management & Storage Engine (LocalStorage + IndexedDB)
import { PRESET_SONGS } from './preset-songs.js';

const STORAGE_KEY = 'mixtape_exact_notes_v12';
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
      title: 'Mixtape for P ✦',
      sender: 'A 🤍',
      recipient: 'P',
      letter: `I don't really know how to put you into words without making it sound smaller than it actually is.

So maybe don't read this like a letter.

Read it like a mixtape.

Every song here carries a little piece of what I couldn't say properly. Some songs remind me of you, some remind me of us, and some just feel like the things I wish I could have said when words weren't enough.

I don't know where our story is going anymore. Maybe neither of us does.

We've had beautiful moments. We've had ugly ones. We've hurt each other, misunderstood each other, and somewhere along the way, things became heavier than they were supposed to be.

But none of that changes the simplest truth:

I loved you. And I still do.

Not because everything between us was perfect. It wasn't.

I loved you in the messy parts too. In the conversations that lasted too long. In the stupid little moments. In the silence. In the days when everything felt right and in the days when it absolutely didn't.

And maybe that's why I made this instead of just writing you a normal letter.

Because music doesn't always need an explanation.

Sometimes a song can say “I miss you.”
Another can say “I'm sorry.”
Another can say “I remember.”
And another can simply say “I loved this moment with you.”

So wherever this mixtape takes you, I hope somewhere between these songs, you find a little bit of us.

Not the arguments.

Not the things that broke.

Just us.

The version of us that laughed without thinking.
The version that could talk for hours.
The version that made ordinary days feel a little less ordinary.

I don't know if we'll ever find our way back to that.

Maybe we won't.

But I don't want the ending of something to erase the fact that, for a while, it meant everything to me.

So press play.

And if you ever wonder what you meant to me—

this is it.`,
      theme: 'rose',
      sticker: 'heart',
      activeSide: 'A',
      sideA: [
        {
          id: 'trk-1',
          title: "Can't Help Falling in Love",
          artist: 'Elvis Presley',
          note: `Maybe this is where everything begins.

That strange feeling of knowing you probably shouldn't fall any further, but somehow you do anyway.

No logic. No calculation.
Just you.`,
          duration: 182,
          source: 'youtube',
          youtubeId: 'vGJTaP6anOU',
          thumbnail: 'https://img.youtube.com/vi/vGJTaP6anOU/mqdefault.jpg',
          url: 'https://youtu.be/vGJTaP6anOU'
        },
        {
          id: 'trk-2',
          title: 'Photograph',
          artist: 'Ed Sheeran',
          note: `Because some things become memories before we even realize we're making them.

The conversations, the stupid moments, the laughs, the little things that probably meant nothing at the time—

they stay.

And sometimes a photograph isn't really a photograph.

Sometimes it's just a reminder that something beautiful actually happened.`,
          duration: 259,
          source: 'youtube',
          youtubeId: 'KKQl-pIRQMY',
          thumbnail: 'https://img.youtube.com/vi/KKQl-pIRQMY/mqdefault.jpg',
          url: 'https://youtu.be/KKQl-pIRQMY'
        },
        {
          id: 'trk-3',
          title: 'Saazish',
          artist: 'Bayaan',
          note: `And then things got complicated.

Feelings rarely arrive at the right time or in the right way. Sometimes two people can care about each other and still somehow end up hurting each other.

Maybe that's the cruelest part.

You can have something real and still not know how to keep it safe.`,
          duration: 215,
          source: 'youtube',
          youtubeId: 'tTPZwlKqawY',
          thumbnail: 'https://img.youtube.com/vi/tTPZwlKqawY/mqdefault.jpg',
          url: 'https://youtu.be/tTPZwlKqawY'
        },
        {
          id: 'trk-4',
          title: 'Ami Sudhu Khujechi Amay',
          artist: 'Taalpatar Shepai',
          note: `Somewhere along the way, I think I lost parts of myself too.

I spent so much time trying to understand us, what we were, what went wrong, what could have been—

that I forgot to ask myself what I wanted and who I was becoming.

Maybe loving someone should never mean completely losing yourself.`,
          duration: 275,
          source: 'youtube',
          youtubeId: 'VKJq7FqYa9c',
          thumbnail: 'https://img.youtube.com/vi/VKJq7FqYa9c/mqdefault.jpg',
          url: 'https://youtu.be/VKJq7FqYa9c'
        }
      ],
      sideB: [
        {
          id: 'trk-5',
          title: 'Sonar Kathi',
          artist: 'Taalpatar Shepai',
          note: `This one feels like the softer part of the story.

The part that doesn't need to explain itself.

Because despite everything, there are memories of you that I don't want to turn bitter just because things became difficult later.

Some things deserve to remain beautiful.`,
          duration: 236,
          source: 'youtube',
          youtubeId: 'GTrvzcwm7tw',
          thumbnail: 'https://img.youtube.com/vi/GTrvzcwm7tw/mqdefault.jpg',
          url: 'https://youtu.be/GTrvzcwm7tw'
        },
        {
          id: 'trk-6',
          title: 'Ocean',
          artist: 'Anuv Jain',
          note: `And then there's the distance.

Not just physical distance.

The kind that happens when two people who once felt incredibly close suddenly have an ocean of things between them—things said, things unsaid, things that can't be undone.

Sometimes you can see someone clearly and still feel impossibly far away.`,
          duration: 212,
          source: 'youtube',
          youtubeId: 'Y2zc2IeVX_g',
          thumbnail: 'https://img.youtube.com/vi/Y2zc2IeVX_g/mqdefault.jpg',
          url: 'https://youtu.be/Y2zc2IeVX_g'
        },
        {
          id: 'trk-7',
          title: 'Tumi Robe Nirobe',
          artist: 'Sanam',
          note: `And maybe this is where I want to leave you.

Not with a promise.

Not with “please come back.”

Not with “everything will be okay.”

Just with the quiet acknowledgement that you were, and are, an important part of my life.

Maybe someday we'll look back at all of this differently.

Maybe we'll laugh about some of it.

Maybe we'll never be what we once were.

I don't know.

But I don't want the difficult ending to rewrite the beginning.

You mattered to me.

You still do.

And perhaps that's all this mixtape is trying to say.`,
          duration: 248,
          source: 'youtube',
          youtubeId: 'qZbdZEFsT3U',
          thumbnail: 'https://img.youtube.com/vi/qZbdZEFsT3U/mqdefault.jpg',
          url: 'https://youtu.be/qZbdZEFsT3U'
        }
      ]
    };
  }

  loadMixtape() {
    // No browser cache stored: always load fresh default curated mixtape
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore if third-party storage is restricted
    }
    return this.getDefaultMixtape();
  }

  saveMixtape(data) {
    // No-op: do not store in browser cache
  }

  resetMixtape() {
    return this.getDefaultMixtape();
  }
}

export const mixtapeStore = new MixtapeStore();
