// Google Authentication & User Mixtape Library Manager
// Supports Google Identity Services (GIS) + Instant Quick Creator Sign-In

const AUTH_STORAGE_KEY = 'mixtape_user_profile';
const USER_MIXTAPES_KEY = 'mixtape_user_library_';
const GOOGLE_CLIENT_ID_KEY = 'mixtape_google_client_id';

export class AuthManager {
  constructor() {
    this.user = this._loadStoredUser();
    this.onAuthStateChanged = null; // (user) => {}
    this._initGIS();
  }

  _loadStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('mixtape_google_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // Quick Sign In (Instant without Google Cloud Console setup)
  quickSignIn(name = 'Mixtape Creator', avatarEmoji = '🎧') {
    const cleanName = (name || 'Mixtape Creator').trim();
    this.user = {
      id: 'creator_' + (this.user?.id ? this.user.id.replace(/^creator_/, '') : Date.now()),
      name: cleanName,
      email: '',
      avatar: '',
      avatarEmoji: avatarEmoji || '🎧',
      authMethod: 'quick'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
    if (this.onAuthStateChanged) this.onAuthStateChanged(this.user);
    return this.user;
  }

  _initGIS() {
    // Check for Google Identity Services library
    let attempts = 0;
    const checkGIS = setInterval(() => {
      attempts++;
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(checkGIS);
        this._setupGoogleButton();
      } else if (attempts > 30) {
        clearInterval(checkGIS);
      }
    }, 200);
  }

  _setupGoogleButton() {
    const containers = [
      document.getElementById('googleSignInBtn'),
      document.getElementById('googleSignInModalBtn')
    ].filter(Boolean);

    if (containers.length === 0) return;

    try {
      const clientId = localStorage.getItem(GOOGLE_CLIENT_ID_KEY) ||
        '1058209849202-e25f82i2a7tks25i311q68g1f4i31t32.apps.googleusercontent.com';

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => this._handleCredentialResponse(response),
        auto_select: false
      });

      if (!this.user) {
        containers.forEach(container => {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'medium',
            shape: 'pill',
            text: 'signin_with'
          });
        });
      }
    } catch (e) {
      console.warn('Google Sign-In initialization deferred:', e);
    }
  }

  // Parse JWT token from Google Identity
  _parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  _handleCredentialResponse(response) {
    if (!response || !response.credential) return;
    const payload = this._parseJwt(response.credential);
    if (!payload) return;

    this.user = {
      id: payload.sub,
      name: payload.name || payload.given_name || 'Mixtape Creator',
      email: payload.email || '',
      avatar: payload.picture || '',
      avatarEmoji: '🎧',
      authMethod: 'google'
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
    if (this.onAuthStateChanged) this.onAuthStateChanged(this.user);
  }

  // Sign out
  signOut() {
    this.user = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('mixtape_google_user');
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
    if (this.onAuthStateChanged) this.onAuthStateChanged(null);
  }

  // Save mixtape under user's account
  saveMixtapeToLibrary(mixtapeData) {
    if (!this.user) return false;
    try {
      const key = USER_MIXTAPES_KEY + this.user.id;
      const existing = this.getUserMixtapes();
      const idx = existing.findIndex(m => m.id === mixtapeData.id);
      
      const copy = { 
        ...mixtapeData, 
        updatedAt: Date.now(), 
        ownerId: this.user.id,
        ownerName: this.user.name 
      };

      if (idx >= 0) {
        existing[idx] = copy;
      } else {
        existing.unshift(copy);
      }
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    } catch (e) {
      console.error('Failed to save to user library:', e);
      return false;
    }
  }

  getUserMixtapes() {
    if (!this.user) return [];
    try {
      const key = USER_MIXTAPES_KEY + this.user.id;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  deleteMixtapeFromLibrary(mixtapeId) {
    if (!this.user) return;
    try {
      const key = USER_MIXTAPES_KEY + this.user.id;
      const list = this.getUserMixtapes().filter(m => m.id !== mixtapeId);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }
}

export const authManager = new AuthManager();
