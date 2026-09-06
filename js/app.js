// Main Application Orchestrator (Single-Page Curvy Aesthetic Mixtape)
import { TapeAudioPlayer } from './audio-player.js?v=8.0';
import { mixtapeStore } from './mixtape-store.js?v=8.0';

class SinglePageMixtapeApp {
  constructor() {
    this.player = new TapeAudioPlayer();
    this.data = mixtapeStore.loadMixtape();
    this.currentTrackIndex = 0;
    this.activeFilter = 'all'; // 'all' | 'A' | 'B'
    this.isMuted = false;
    this.lastVolume = 0.85;

    this._cacheDOMElements();
    this._initEventListeners();
    this._setupPlayerCallbacks();
    this._renderAll();
  }

  _cacheDOMElements() {
    // Step 1: Gift Landing Screen
    this.giftLandingOverlay = document.getElementById('giftLandingOverlay');
    this.btnOpenGiftBox = document.getElementById('btnOpenGiftBox');
    this.giftBoxTrigger = document.getElementById('giftBoxTrigger');

    // Header & Titles
    this.appTitleDisplay = document.getElementById('appTitleDisplay');
    this.appSubtitleDisplay = document.getElementById('appSubtitleDisplay');
    this.btnOpenLetter = document.getElementById('btnOpenLetter');
    this.btnOpenEdit = document.getElementById('btnOpenEdit');

    // Player Elements
    this.albumBackdropBlur = document.getElementById('albumBackdropBlur');
    this.albumArtImg = document.getElementById('albumArtImg');
    this.vinylDisc = document.getElementById('vinylDisc');
    this.vinylLabel = document.getElementById('vinylLabel');
    this.hifiLed = document.getElementById('hifiLed');
    this.albumArtBars = document.getElementById('albumArtBars');
    this.trackIndexBadge = document.getElementById('trackIndexBadge');
    this.playerTrackTitle = document.getElementById('playerTrackTitle');
    this.playerTrackArtist = document.getElementById('playerTrackArtist');
    this.equalizerBars = document.getElementById('equalizerBars');
    this.currentSideBadge = document.getElementById('currentSideBadge');

    // Controls
    this.currentTimeLabel = document.getElementById('currentTimeLabel');
    this.durationLabel = document.getElementById('durationLabel');
    this.progressFill = document.getElementById('progressFill');
    this.progressSlider = document.getElementById('progressSlider');
    this.btnPrevTrack = document.getElementById('btnPrevTrack');
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.playIconSvg = document.getElementById('playIconSvg');
    this.pauseIconSvg = document.getElementById('pauseIconSvg');
    this.btnNextTrack = document.getElementById('btnNextTrack');
    this.btnMute = document.getElementById('btnMute');
    this.volumeSlider = document.getElementById('volumeSlider');

    // Note Card
    this.activeSongNote = document.getElementById('activeSongNote');
    this.noteSongReference = document.getElementById('noteSongReference');
    this.btnEditCurrentNote = document.getElementById('btnEditCurrentNote');

    // Playlist
    this.tracklistContainer = document.getElementById('tracklistContainer');
    this.playlistTrackCount = document.getElementById('playlistTrackCount');
    this.tabAll = document.getElementById('tabAll');
    this.tabSideA = document.getElementById('tabSideA');
    this.tabSideB = document.getElementById('tabSideB');

    // Modals
    this.modalLetter = document.getElementById('modalLetter');
    this.btnCloseLetter = document.getElementById('btnCloseLetter');
    this.btnCloseLetterBtn = document.getElementById('btnCloseLetterBtn');
    this.letterModalRecipient = document.getElementById('letterModalRecipient');
    this.letterModalSender = document.getElementById('letterModalSender');
    this.letterModalContent = document.getElementById('letterModalContent');
    this.btnEditLetterFromModal = document.getElementById('btnEditLetterFromModal');

    this.modalEdit = document.getElementById('modalEdit');
    this.btnCloseEdit = document.getElementById('btnCloseEdit');
    this.btnCancelEdit = document.getElementById('btnCancelEdit');
    this.btnSaveEdit = document.getElementById('btnSaveEdit');
    this.inputMixtapeTitle = document.getElementById('inputMixtapeTitle');
    this.inputRecipient = document.getElementById('inputRecipient');
    this.inputSender = document.getElementById('inputSender');
    this.inputLetterBody = document.getElementById('inputLetterBody');
    this.editNotesList = document.getElementById('editNotesList');

    this.modalQuickNote = document.getElementById('modalQuickNote');
    this.btnCloseQuickNote = document.getElementById('btnCloseQuickNote');
    this.btnCancelQuickNote = document.getElementById('btnCancelQuickNote');
    this.btnSaveQuickNote = document.getElementById('btnSaveQuickNote');
    this.quickNoteSongTitle = document.getElementById('quickNoteSongTitle');
    this.inputQuickNoteText = document.getElementById('inputQuickNoteText');

    this.toastMessage = document.getElementById('toastMessage');
  }

  // Get all 7 tracks in flat array with side notation
  getAllTracks() {
    const sideA = (this.data.sideA || []).map((t, i) => ({ ...t, side: 'A', trackIndex: i }));
    const sideB = (this.data.sideB || []).map((t, i) => ({ ...t, side: 'B', trackIndex: sideA.length + i }));
    return [...sideA, ...sideB];
  }

  getCurrentTrack() {
    const tracks = this.getAllTracks();
    if (this.currentTrackIndex >= tracks.length) {
      this.currentTrackIndex = 0;
    }
    return tracks[this.currentTrackIndex] || null;
  }

  _setupPlayerCallbacks() {
    this.player.onPlayStateChange = (isPlaying) => {
      if (this.playIconSvg && this.pauseIconSvg) {
        this.playIconSvg.style.display = isPlaying ? 'none' : 'block';
        this.pauseIconSvg.style.display = isPlaying ? 'block' : 'none';
      }

      if (this.equalizerBars) {
        if (isPlaying) {
          this.equalizerBars.classList.add('playing');
        } else {
          this.equalizerBars.classList.remove('playing');
        }
      }

      if (this.vinylDisc) {
        if (isPlaying) this.vinylDisc.classList.add('spinning');
        else this.vinylDisc.classList.remove('spinning');
      }

      if (this.albumArtBars) {
        if (isPlaying) this.albumArtBars.classList.add('playing');
        else this.albumArtBars.classList.remove('playing');
      }

      if (this.hifiLed) {
        if (isPlaying) this.hifiLed.classList.add('active');
        else this.hifiLed.classList.remove('active');
      }

      // Update active track card
      const cards = this.tracklistContainer.querySelectorAll('.track-card');
      cards.forEach((card, idx) => {
        if (idx === this.currentTrackIndex) {
          if (isPlaying) {
            card.classList.add('is-playing');
          } else {
            card.classList.remove('is-playing');
          }
        } else {
          card.classList.remove('is-playing');
        }
      });
    };

    this.player.onTimeUpdate = ({ currentTime, duration, progressPercent }) => {
      if (this.currentTimeLabel) {
        this.currentTimeLabel.textContent = this._formatTime(currentTime);
      }
      if (this.durationLabel) {
        this.durationLabel.textContent = this._formatTime(duration);
      }
      if (this.progressFill) {
        this.progressFill.style.width = `${progressPercent}%`;
      }
      if (this.progressSlider) {
        this.progressSlider.value = progressPercent;
      }
    };

    this.player.onTrackEnded = () => {
      this.nextTrack(true);
    };
  }

  _formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  _initEventListeners() {
    // Play/Pause
    this.btnPlayPause.addEventListener('click', () => {
      this.player.togglePlay();
    });

    // Prev / Next
    this.btnPrevTrack.addEventListener('click', () => {
      this.prevTrack();
    });

    this.btnNextTrack.addEventListener('click', () => {
      this.nextTrack(true);
    });

    // Scrubber
    this.progressSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (this.progressFill) this.progressFill.style.width = `${val}%`;
      this.player.seek(val);
    });

    // Volume Slider
    this.volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      this.player.setVolume(val);
      this.lastVolume = val;
      this.isMuted = val === 0;
    });

    // Mute button
    this.btnMute.addEventListener('click', () => {
      if (this.isMuted) {
        const restore = this.lastVolume > 0 ? this.lastVolume : 0.8;
        this.player.setVolume(restore);
        this.volumeSlider.value = restore * 100;
        this.isMuted = false;
      } else {
        this.player.setVolume(0);
        this.volumeSlider.value = 0;
        this.isMuted = true;
      }
    });

    // Side filter tabs
    this.tabAll.addEventListener('click', () => this.setFilter('all'));
    this.tabSideA.addEventListener('click', () => this.setFilter('A'));
    this.tabSideB.addEventListener('click', () => this.setFilter('B'));

    // Step 1: Gift Box Landing Listeners
    if (this.btnOpenGiftBox) this.btnOpenGiftBox.addEventListener('click', () => this.openGiftLanding());
    if (this.giftBoxTrigger) this.giftBoxTrigger.addEventListener('click', () => this.openGiftLanding());

    // Header buttons
    if (this.btnOpenLetter) this.btnOpenLetter.addEventListener('click', () => this.openLetterModal());
    if (this.btnOpenEdit) this.btnOpenEdit.addEventListener('click', () => this.openEditModal());

    // Letter Modal
    if (this.btnCloseLetter) this.btnCloseLetter.addEventListener('click', () => this.closeLetterModal());
    if (this.btnCloseLetterBtn) this.btnCloseLetterBtn.addEventListener('click', () => this.closeLetterModal());
    if (this.btnEditLetterFromModal) {
      this.btnEditLetterFromModal.addEventListener('click', () => {
        this.closeLetterModal();
        this.openEditModal();
      });
    }

    // Edit Modal
    if (this.btnCloseEdit) this.btnCloseEdit.addEventListener('click', () => this.closeEditModal());
    if (this.btnCancelEdit) this.btnCancelEdit.addEventListener('click', () => this.closeEditModal());
    if (this.btnSaveEdit) this.btnSaveEdit.addEventListener('click', () => this.saveEditChanges());

    // Quick Note Modal
    if (this.btnEditCurrentNote) this.btnEditCurrentNote.addEventListener('click', () => this.openQuickNoteModal());
    if (this.btnCloseQuickNote) this.btnCloseQuickNote.addEventListener('click', () => this.closeQuickNoteModal());
    if (this.btnCancelQuickNote) this.btnCancelQuickNote.addEventListener('click', () => this.closeQuickNoteModal());
    if (this.btnSaveQuickNote) this.btnSaveQuickNote.addEventListener('click', () => this.saveQuickNote());

    // Close modals on overlay backdrop click
    [this.modalLetter, this.modalEdit, this.modalQuickNote].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Keyboard Shortcuts (Space for Play/Pause, Left/Right for tracks)
    window.addEventListener('keydown', (e) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.player.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextTrack(true);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevTrack();
      }
    });
  }

  setFilter(filter) {
    this.activeFilter = filter;
    [this.tabAll, this.tabSideA, this.tabSideB].forEach(tab => tab.classList.remove('active'));
    if (filter === 'all') this.tabAll.classList.add('active');
    else if (filter === 'A') this.tabSideA.classList.add('active');
    else if (filter === 'B') this.tabSideB.classList.add('active');
    this.renderPlaylist();
  }

  prevTrack() {
    const tracks = this.getAllTracks();
    if (tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + tracks.length) % tracks.length;
    this.loadCurrentTrack(true);
  }

  nextTrack(autoPlay = true) {
    const tracks = this.getAllTracks();
    if (tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    this.loadCurrentTrack(autoPlay);
  }

  selectTrackByIndex(globalIndex, autoPlay = true) {
    this.currentTrackIndex = globalIndex;
    this.loadCurrentTrack(autoPlay);
  }

  loadCurrentTrack(autoPlay = false) {
    const track = this.getCurrentTrack();
    if (!track) return;

    // Update screen info
    const globalIdxStr = String(this.currentTrackIndex + 1).padStart(2, '0');
    this.trackIndexBadge.textContent = `Track ${globalIdxStr}`;
    this.playerTrackTitle.textContent = track.title;
    this.playerTrackArtist.textContent = track.artist;
    this.currentSideBadge.textContent = `Side ${track.side || 'A'}`;

    // Update Note Card
    this.activeSongNote.textContent = track.note || 'No note added yet for this track. Click "Edit Note" to write one!';
    this.noteSongReference.textContent = `For Track ${globalIdxStr} · ${track.title}`;

    // Update Album Artwork & Dynamic Blurred Backdrop
    const thumbUrl = track.thumbnail || (track.youtubeId ? `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg` : 'assets/tape-placeholder.png');
    if (this.albumArtImg) this.albumArtImg.src = thumbUrl;
    if (this.albumBackdropBlur) this.albumBackdropBlur.style.backgroundImage = `url("${thumbUrl}")`;
    if (this.vinylLabel) this.vinylLabel.style.backgroundImage = `url("${thumbUrl}")`;

    // Audio player cue / load
    this.player.loadTrack(track, autoPlay);

    // Update active highlight in playlist
    this.updatePlaylistActiveState();
  }

  updatePlaylistActiveState() {
    const cards = this.tracklistContainer.querySelectorAll('.track-card');
    cards.forEach((card) => {
      const idx = parseInt(card.dataset.globalIndex, 10);
      if (idx === this.currentTrackIndex) {
        card.classList.add('active');
        if (this.player.isPlaying) {
          card.classList.add('is-playing');
        }
      } else {
        card.classList.remove('active', 'is-playing');
      }
    });
  }

  _renderAll() {
    this.renderHeader();
    this.renderPlaylist();
    this.loadCurrentTrack(false);
  }

  renderHeader() {
    if (this.data.title) {
      this.appTitleDisplay.textContent = this.data.title;
      document.title = `${this.data.title} ✦ Mixtape`;
    }
    if (this.data.recipient && this.data.sender) {
      this.appSubtitleDisplay.textContent = `For ${this.data.recipient}, from ${this.data.sender}`;
    }
  }

  renderPlaylist() {
    const allTracks = this.getAllTracks();
    this.playlistTrackCount.textContent = `${allTracks.length} Handpicked Songs`;

    const filtered = allTracks.filter(t => {
      if (this.activeFilter === 'all') return true;
      return t.side === this.activeFilter;
    });

    this.tracklistContainer.innerHTML = '';

    filtered.forEach((track) => {
      const card = document.createElement('div');
      card.className = `track-card ${track.trackIndex === this.currentTrackIndex ? 'active' : ''}`;
      if (track.trackIndex === this.currentTrackIndex && this.player.isPlaying) {
        card.classList.add('is-playing');
      }
      card.dataset.globalIndex = track.trackIndex;

      const numStr = String(track.trackIndex + 1).padStart(2, '0');
      const thumbUrl = track.thumbnail || (track.youtubeId ? `https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg` : 'assets/tape-placeholder.png');
      const durationStr = this._formatTime(track.duration || 180);

      const firstLine = (track.note || '').split('\n').find(l => l.trim().length > 0) || 'Click to listen';

      card.innerHTML = `
        <span class="track-num">${numStr}</span>
        <div class="track-thumb-wrap">
          <img class="track-thumb-img" src="${thumbUrl}" alt="${track.title}" loading="lazy">
          <div class="track-play-badge">▶</div>
        </div>
        <div class="track-meta">
          <h4 class="track-title">${track.title}</h4>
          <p class="track-artist">${track.artist} · Side ${track.side}</p>
          <p class="track-note-preview">"${firstLine}"</p>
        </div>
        <div class="track-end-meta">
          <span class="track-duration">${durationStr}</span>
          <div class="mini-equalizer">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectTrackByIndex(track.trackIndex, true);
      });

      this.tracklistContainer.appendChild(card);
    });
  }

  // ================= MODAL HANDLERS =================

  openGiftLanding() {
    if (this.giftLandingOverlay) {
      this.giftLandingOverlay.classList.add('opening');
      setTimeout(() => {
        this.giftLandingOverlay.style.display = 'none';
        this.openLetterModal();
      }, 400);
    }
  }

  openLetterModal() {
    this.letterModalRecipient.textContent = this.data.recipient || 'P';
    this.letterModalSender.textContent = this.data.sender || 'A 🤍';
    this.letterModalContent.textContent = this.data.letter || '';
    this.modalLetter.style.display = 'flex';
  }

  closeLetterModal() {
    this.modalLetter.style.display = 'none';
    // When letter is closed, begin playing Track 01 on the final mixtape page
    if (!this.player.isPlaying) {
      this.player.play();
    }
  }

  openEditModal() {
    this.inputMixtapeTitle.value = this.data.title || '';
    this.inputRecipient.value = this.data.recipient || '';
    this.inputSender.value = this.data.sender || '';
    this.inputLetterBody.value = this.data.letter || '';

    // Populate the 7 track notes
    const allTracks = this.getAllTracks();
    this.editNotesList.innerHTML = '';

    allTracks.forEach((track) => {
      const item = document.createElement('div');
      item.className = 'edit-note-item';
      const numStr = String(track.trackIndex + 1).padStart(2, '0');

      item.innerHTML = `
        <div class="edit-note-item-header">
          <span class="edit-note-track-name">Track ${numStr}: ${track.title} (${track.artist})</span>
          <span class="side-indicator">Side ${track.side}</span>
        </div>
        <textarea class="form-textarea" rows="2" data-side="${track.side}" data-local-idx="${track.side === 'A' ? track.trackIndex : track.trackIndex - (this.data.sideA?.length || 0)}" placeholder="Personal note for this song...">${track.note || ''}</textarea>
      `;

      this.editNotesList.appendChild(item);
    });

    this.modalEdit.style.display = 'flex';
  }

  closeEditModal() {
    this.modalEdit.style.display = 'none';
  }

  saveEditChanges() {
    this.data.title = this.inputMixtapeTitle.value.trim() || 'Mixtape for P ✦';
    this.data.recipient = this.inputRecipient.value.trim() || 'P';
    this.data.sender = this.inputSender.value.trim() || 'A 🤍';
    this.data.letter = this.inputLetterBody.value.trim() || '';

    // Read notes from textarea inputs
    const textareas = this.editNotesList.querySelectorAll('textarea');
    textareas.forEach((ta) => {
      const side = ta.dataset.side;
      const localIdx = parseInt(ta.dataset.localIdx, 10);
      const noteVal = ta.value.trim();

      if (side === 'A' && this.data.sideA && this.data.sideA[localIdx]) {
        this.data.sideA[localIdx].note = noteVal;
      } else if (side === 'B' && this.data.sideB && this.data.sideB[localIdx]) {
        this.data.sideB[localIdx].note = noteVal;
      }
    });

    // Save to local storage
    mixtapeStore.saveMixtape(this.data);

    // Refresh UI
    this.renderHeader();
    this.renderPlaylist();
    this.loadCurrentTrack(false);

    this.closeEditModal();
    this.showToast('Mixtape & Notes Saved! ✨');
  }

  openQuickNoteModal() {
    const track = this.getCurrentTrack();
    if (!track) return;

    this.quickNoteSongTitle.textContent = `${track.title} - ${track.artist}`;
    this.inputQuickNoteText.value = track.note || '';
    this.modalQuickNote.style.display = 'flex';
    this.inputQuickNoteText.focus();
  }

  closeQuickNoteModal() {
    this.modalQuickNote.style.display = 'none';
  }

  saveQuickNote() {
    const track = this.getCurrentTrack();
    if (!track) return;

    const newNote = this.inputQuickNoteText.value.trim();
    track.note = newNote;

    // Persist to underlying data array
    if (track.side === 'A' && this.data.sideA) {
      const item = this.data.sideA.find(t => t.id === track.id || t.title === track.title);
      if (item) item.note = newNote;
    } else if (track.side === 'B' && this.data.sideB) {
      const item = this.data.sideB.find(t => t.id === track.id || t.title === track.title);
      if (item) item.note = newNote;
    }

    mixtapeStore.saveMixtape(this.data);

    // Update stationery card
    this.activeSongNote.textContent = newNote || 'No note added yet for this track.';
    this.renderPlaylist();
    this.closeQuickNoteModal();
    this.showToast('Song note updated! 💌');
  }

  showToast(message) {
    this.toastMessage.textContent = message;
    this.toastMessage.classList.add('show');
    setTimeout(() => {
      this.toastMessage.classList.remove('show');
    }, 2800);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SinglePageMixtapeApp();
});
