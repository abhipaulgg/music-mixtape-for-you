// Google Authentication & User Mixtape Library Manager
// Uses Google Identity Services (GIS) with local fallback

const AUTH_STORAGE_KEY = 'mixtape_google_user';
const USER_MIXTAPES_KEY = 'mixtape_user_library_';

export class AuthManager {
  constructor() {
    this.user = this._loadStoredUser();
    this.onAuthStateChanged = null; // (user) => {}
    this._initGIS();
  }

  _loadStoredUser() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  _initGIS() {
    // Wait for Google Identity Services script to be available
    const checkGIS = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(checkGIS);
        this._setupGoogleButton();
      }
    }, 200);
  }

  _setupGoogleButton() {
    const btnContainer = document.getElementById('googleSignInBtn');
    if (!btnContainer) return;

    try {
      window.google.accounts.id.initialize({
        // Public client ID for demo/web app auth
        client_id: '1058209849202-e25f82i2a7tks25i311q68g1f4i31t32.apps.googleusercontent.com',
        callback: (response) => this._handleCredentialResponse(response),
        auto_select: false
      });

      if (!this.user) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          text: 'signin_with'
        });
      }
    } catch (e) {
      console.warn('GIS button render deferred:', e);
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
      email: payload.email,
      avatar: payload.picture || ''
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.user));
    if (this.onAuthStateChanged) this.onAuthStateChanged(this.user);
  }

  // Sign out
  signOut() {
    this.user = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
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
      
      const copy = { ...mixtapeData, updatedAt: Date.now(), ownerEmail: this.user.email };
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
