// Share & Gift Engine
// Supports URL hash encoding, JSON export/import, and Recipient Gift Mode

export class ShareEngine {
  static getProductionBaseUrl() {
    // If running on GitHub Pages, use current origin + pathname
    if (window.location.hostname.includes('github.io')) {
      return window.location.origin + window.location.pathname;
    }
    // If running on localhost or file://, use your live GitHub Pages URL so recipients can open it anywhere!
    return 'https://abhipaulgg.github.io/music-mixtape-for-you/';
  }

  // Compress and encode mixtape to URL-safe Base64 string
  static encodeToHash(mixtapeData, giftMode = true) {
    try {
      // Strip large blobs if any, retain metadata and URLs
      const cleanData = {
        title: mixtapeData.title,
        sender: mixtapeData.sender,
        recipient: mixtapeData.recipient,
        letter: mixtapeData.letter,
        theme: mixtapeData.theme,
        sticker: mixtapeData.sticker,
        sideA: (mixtapeData.sideA || []).map(t => ({
          title: t.title,
          artist: t.artist,
          note: t.note,
          duration: t.duration,
          source: t.source,
          url: t.url,
          youtubeId: t.youtubeId,
          thumbnail: t.thumbnail,
          proceduralKey: t.proceduralKey
        })),
        sideB: (mixtapeData.sideB || []).map(t => ({
          title: t.title,
          artist: t.artist,
          note: t.note,
          duration: t.duration,
          source: t.source,
          url: t.url,
          youtubeId: t.youtubeId,
          thumbnail: t.thumbnail,
          proceduralKey: t.proceduralKey
        }))
      };

      const json = JSON.stringify(cleanData);
      const rawB64 = btoa(encodeURIComponent(json));
      // Make Base64 URL safe: replace + with -, / with _, and trim padding =
      const urlSafeB64 = rawB64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const baseUrl = this.getProductionBaseUrl();
      const cleanBase = baseUrl.split('#')[0].split('?')[0];

      return `${cleanBase}#tape=${urlSafeB64}${giftMode ? '&gift=1' : ''}`;
    } catch (e) {
      console.error('Failed to encode mixtape data:', e);
      return window.location.href;
    }
  }

  // Decode from current window URL hash or search params
  static decodeFromURL() {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const combined = hash.replace(/^#/, '') + '&' + search.replace(/^\?/, '');
      
      if (!combined.includes('tape=')) return null;

      const params = new URLSearchParams(combined);
      const tapeParam = params.get('tape');
      const isGift = params.get('gift') === '1' || params.has('gift');

      if (!tapeParam) return null;

      // Restore standard Base64 padding and characters
      let cleanParam = tapeParam.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
      while (cleanParam.length % 4 !== 0) {
        cleanParam += '=';
      }

      const decodedJson = decodeURIComponent(atob(cleanParam));
      const data = JSON.parse(decodedJson);

      return {
        data,
        isGift
      };
    } catch (e) {
      console.warn('Failed to parse mixtape from URL:', e);
      return null;
    }
  }

  // Export mixtape as downloadable .json file
  static downloadJSON(mixtapeData) {
    const filename = `${mixtapeData.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_mixtape.json`;
    const blob = new Blob([JSON.stringify(mixtapeData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Read uploaded .json file
  static importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data && (data.sideA || data.sideB)) {
            resolve(data);
          } else {
            reject(new Error('Invalid mixtape file format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}
