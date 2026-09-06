// Main Application Orchestrator
import { TapeAudioPlayer } from './audio-player.js';
import { mixtapeStore } from './mixtape-store.js';
import { ShareEngine } from './share-engine.js';
import { PRESET_SONGS } from './preset-songs.js';

class MixtapeApp {
  constructor() {
    this.player = new TapeAudioPlayer();
    this.data = mixtapeStore.loadMixtape();
    this.activeSide = 'A';
    this.currentTrackIndex = 0;
    this.isFlipped = false;

    this._checkURLParameters();
    this._cacheDOMElements();
    this._initEventListeners();
    this._renderAll();
  }

  _checkURLParameters() {
    const urlData = ShareEngine.decodeFromURL();
    if (urlData && urlData.data) {
      this.data = {
        ...this.data,
        ...urlData.data,
        id: 'shared-' + Date.now()
      };
      // If shared in gift mode, trigger the gift overlay
      if (urlData.isGift) {
        this.startInGiftMode = true;
      }
    }
  }

  _cacheDOMElements() {
    // Header & Subtitles
    this.headerSubtitle = document.getElementById('headerSubtitle');
    this.btnOpenLetter = document.getElementById('btnOpenLetter');
    this.btnOpenCustomize = document.getElementById('btnOpenCustomize');
    this.btnOpenAddSong = document.getElementById('btnOpenAddSong');
    this.btnOpenShare = document.getElementById('btnOpenShare');

    // Cassette Elements
    this.cassetteFlipper = document.getElementById('cassetteFlipper');
    this.cassetteTitleTexts = document.querySelectorAll('.cassette-title-text');
    this.tapeCounter = document.getElementById('tapeCounter');
    this.tapeCounterB = document.getElementById('tapeCounterB');
    this.leftTapePackA = document.getElementById('leftTapePackA');
    this.rightTapePackA = document.getElementById('rightTapePackA');
    this.leftTapePackB = document.getElementById('leftTapePackB');
    this.rightTapePackB = document.getElementById('rightTapePackB');
    this.stickerBadgeA = document.getElementById('stickerBadgeA');
    this.stickerBadgeB = document.getElementById('stickerBadgeB');

    // Transport Controls
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.playBtnLabel = document.getElementById('playBtnLabel');
    this.playIconSvg = document.getElementById('playIconSvg');
    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.btnFlipSide = document.getElementById('btnFlipSide');

    // Volume & FX Toolbar
    this.currentTimeLabel = document.getElementById('currentTimeLabel');
    this.durationLabel = document.getElementById('durationLabel');
    this.progressBarWrap = document.getElementById('progressBarWrap');
    this.progressBarFill = document.getElementById('progressBarFill');
    this.volumeSlider = document.getElementById('volumeSlider');
    this.btnHissToggle = document.getElementById('btnHissToggle');
    this.btnToggleVideoView = document.getElementById('btnToggleVideoView');
    this.videoScreenContainer = document.getElementById('videoScreenContainer');

    // Memory Note Card
    this.memoryCard = document.getElementById('memoryCard');
    this.memoryTrackTitle = document.getElementById('memoryTrackTitle');
    this.memoryTrackText = document.getElementById('memoryTrackText');

    // Playlist / Tracklist
    this.tabSideA = document.getElementById('tabSideA');
    this.tabSideB = document.getElementById('tabSideB');
    this.sideACount = document.getElementById('sideACount');
    this.sideBCount = document.getElementById('sideBCount');
    this.tracksContainer = document.getElementById('tracksContainer');

    // Letter Modal
    this.letterModal = document.getElementById('letterModal');
    this.btnCloseLetter = document.getElementById('btnCloseLetter');
    this.letterRecipientHeader = document.getElementById('letterRecipientHeader');
    this.letterBody = document.getElementById('letterBody');
    this.letterSenderSignature = document.getElementById('letterSenderSignature');

    // Customize Modal
    this.customizeModal = document.getElementById('customizeModal');
    this.btnCloseCustomize = document.getElementById('btnCloseCustomize');
    this.inputMixtapeTitle = document.getElementById('inputMixtapeTitle');
    this.inputRecipient = document.getElementById('inputRecipient');
    this.inputSender = document.getElementById('inputSender');
    this.inputLetter = document.getElementById('inputLetter');
    this.themePills = document.getElementById('themePills');
    this.stickerPills = document.getElementById('stickerPills');
    this.btnSaveCustomize = document.getElementById('btnSaveCustomize');
    this.btnResetDefaults = document.getElementById('btnResetDefaults');

    // Add Song Modal
    this.addSongModal = document.getElementById('addSongModal');
    this.btnCloseAddSong = document.getElementById('btnCloseAddSong');
    this.btnCancelAddSong = document.getElementById('btnCancelAddSong');
    this.btnSaveSong = document.getElementById('btnSaveSong');
    this.addSidePills = document.getElementById('addSidePills');
    this.sourcePills = document.getElementById('sourcePills');

    // Input Groups
    this.groupYouTube = document.getElementById('groupYouTube');
    this.groupSearchSong = document.getElementById('groupSearchSong');
    this.groupPresetSelect = document.getElementById('groupPresetSelect');
    this.groupFileUpload = document.getElementById('groupFileUpload');
    this.groupAudioUrl = document.getElementById('groupAudioUrl');

    // YouTube elements
    this.inputYouTubeUrl = document.getElementById('inputYouTubeUrl');
    this.btnFetchYT = document.getElementById('btnFetchYT');
    this.ytPreviewCard = document.getElementById('ytPreviewCard');
    this.ytPreviewThumb = document.getElementById('ytPreviewThumb');
    this.ytPreviewTitle = document.getElementById('ytPreviewTitle');
    this.ytPreviewAuthor = document.getElementById('ytPreviewAuthor');

    // Search elements
    this.inputSongSearch = document.getElementById('inputSongSearch');
    this.searchResultsList = document.getElementById('searchResultsList');

    // Presets & inputs
    this.presetPickerList = document.getElementById('presetPickerList');
    this.inputAudioFile = document.getElementById('inputAudioFile');
    this.inputAudioUrl = document.getElementById('inputAudioUrl');
    this.inputSongTitle = document.getElementById('inputSongTitle');
    this.inputSongArtist = document.getElementById('inputSongArtist');
    this.inputSongNote = document.getElementById('inputSongNote');

    // Share Modal
    this.shareModal = document.getElementById('shareModal');
    this.btnCloseShare = document.getElementById('btnCloseShare');
    this.btnDoneShare = document.getElementById('btnDoneShare');
    this.inputShareLink = document.getElementById('inputShareLink');
    this.btnCopyLink = document.getElementById('btnCopyLink');
    this.copySuccessNotice = document.getElementById('copySuccessNotice');
    this.btnDownloadJSON = document.getElementById('btnDownloadJSON');
    this.inputImportJSON = document.getElementById('inputImportJSON');

    // Gift Mode Overlay
    this.giftOverlay = document.getElementById('giftOverlay');
    this.giftRecipientDisplay = document.getElementById('giftRecipientDisplay');
    this.giftSubtitleDisplay = document.getElementById('giftSubtitleDisplay');
    this.btnBreakSeal = document.getElementById('btnBreakSeal');
  }

  _initEventListeners() {
    // Player Callbacks
    this.player.onPlayStateChange = (isPlaying) => this._updatePlayState(isPlaying);
    this.player.onTimeUpdate = (data) => this._updateProgress(data);
    this.player.onTrackEnded = () => this.nextTrack();

    // Transport buttons
    this.btnPlayPause.addEventListener('click', () => this.togglePlay());
    this.btnPrev.addEventListener('click', () => this.prevTrack());
    this.btnNext.addEventListener('click', () => this.nextTrack());
    this.btnFlipSide.addEventListener('click', () => this.flipTape());

    // Scrubber click
    this.progressBarWrap.addEventListener('click', (e) => {
      const rect = this.progressBarWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      this.player.seek(percent);
    });

    // Volume Slider
    this.volumeSlider.addEventListener('input', (e) => {
      this.player.setVolume(parseFloat(e.target.value));
    });

    // Tape hiss toggle
    this.btnHissToggle.addEventListener('click', () => {
      const active = !this.player.isHissActive;
      this.player.setHiss(active);
      this.btnHissToggle.classList.toggle('active', active);
    });

    // Video Screen Toggle
    this.btnToggleVideoView.addEventListener('click', () => {
      const isVisible = this.videoScreenContainer.style.display !== 'none';
      this.videoScreenContainer.style.display = isVisible ? 'none' : 'block';
      this.btnToggleVideoView.classList.toggle('active', !isVisible);
    });

    // Side Tab clicks
    this.tabSideA.addEventListener('click', () => this.switchSide('A'));
    this.tabSideB.addEventListener('click', () => this.switchSide('B'));

    // Modals open/close
    this.btnOpenLetter.addEventListener('click', () => this._openLetterModal());
    this.btnCloseLetter.addEventListener('click', () => this.letterModal.classList.remove('active'));

    this.btnOpenCustomize.addEventListener('click', () => this._openCustomizeModal());
    this.btnCloseCustomize.addEventListener('click', () => this.customizeModal.classList.remove('active'));
    this.btnSaveCustomize.addEventListener('click', () => this._saveCustomizeModal());
    this.btnResetDefaults.addEventListener('click', () => this._resetDefaults());

    this.btnOpenAddSong.addEventListener('click', () => this._openAddSongModal());
    this.btnCloseAddSong.addEventListener('click', () => this.addSongModal.classList.remove('active'));
    this.btnCancelAddSong.addEventListener('click', () => this.addSongModal.classList.remove('active'));
    this.btnSaveSong.addEventListener('click', () => this._saveNewSong());

    // YouTube Fetch Info button & input listeners
    this.btnFetchYT.addEventListener('click', () => this._handleFetchYouTube());
    this.inputYouTubeUrl.addEventListener('paste', () => {
      setTimeout(() => this._handleFetchYouTube(), 100);
    });
    this.inputYouTubeUrl.addEventListener('change', () => this._handleFetchYouTube());

    // Search Real Songs (debounced input)
    let searchDebounceTimer = null;
    this.inputSongSearch.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      const val = e.target.value.trim();
      searchDebounceTimer = setTimeout(() => {
        this._searchRealSongs(val);
      }, 350);
    });

    this.btnOpenShare.addEventListener('click', () => this._openShareModal());
    this.btnCloseShare.addEventListener('click', () => this.shareModal.classList.remove('active'));
    this.btnDoneShare.addEventListener('click', () => this.shareModal.classList.remove('active'));
    this.btnCopyLink.addEventListener('click', () => this._copyShareLink());
    this.btnDownloadJSON.addEventListener('click', () => ShareEngine.downloadJSON(this.data));
    this.inputImportJSON.addEventListener('change', (e) => this._handleImportJSON(e));

    // Sticker click on tape
    this.stickerBadgeA.addEventListener('click', () => this._cycleSticker());
    this.stickerBadgeB.addEventListener('click', () => this._cycleSticker());

    // Gift unwrap button
    this.btnBreakSeal.addEventListener('click', () => this._unwrapGift());

    // Initialize pill selection behavior
    this._setupPills(this.themePills);
    this._setupPills(this.stickerPills);
    this._setupPills(this.addSidePills);
    this._setupPills(this.sourcePills, (val) => this._onSourceChanged(val));
  }

  _setupPills(container, onChange) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const pill = e.target.closest('.radio-pill');
      if (!pill) return;
      container.querySelectorAll('.radio-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      if (onChange) onChange(pill.getAttribute('data-value'));
    });
  }

  _onSourceChanged(source) {
    this.groupYouTube.style.display = source === 'youtube' ? 'block' : 'none';
    this.groupSearchSong.style.display = source === 'search' ? 'block' : 'none';
    this.groupPresetSelect.style.display = source === 'preset' ? 'block' : 'none';
    this.groupFileUpload.style.display = source === 'upload' ? 'block' : 'none';
    this.groupAudioUrl.style.display = source === 'url' ? 'block' : 'none';
  }

  _renderAll() {
    this._applyTheme(this.data.theme || 'rose');
    this._renderCassetteMetadata();
    this._renderTracklist();
    this._loadCurrentTrack(false);

    if (this.startInGiftMode) {
      this._showGiftOverlay();
    }
  }

  _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  _renderCassetteMetadata() {
    const title = this.data.title || 'Our Mixtape';
    this.cassetteTitleTexts.forEach(el => el.textContent = title);

    const recipient = this.data.recipient || 'Someone Special';
    const sender = this.data.sender || 'Alex';
    this.headerSubtitle.textContent = `For ${recipient} • From ${sender} ❤️`;

    // Sticker map
    const stickerMap = {
      heart: '❤️',
      star: '⭐',
      flower: '🌸',
      sparkle: '✨',
      cat: '🐾',
      note: '🎵'
    };
    const stickerIcon = stickerMap[this.data.sticker] || '❤️';
    this.stickerBadgeA.textContent = stickerIcon;
    this.stickerBadgeB.textContent = stickerIcon;
  }

  _renderTracklist() {
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;

    this.sideACount.textContent = `${this.data.sideA.length} track${this.data.sideA.length === 1 ? '' : 's'}`;
    this.sideBCount.textContent = `${this.data.sideB.length} track${this.data.sideB.length === 1 ? '' : 's'}`;

    this.tabSideA.classList.toggle('active', this.activeSide === 'A');
    this.tabSideB.classList.toggle('active', this.activeSide === 'B');

    this.tracksContainer.innerHTML = '';

    if (!sideTracks || sideTracks.length === 0) {
      this.tracksContainer.innerHTML = `
        <div class="empty-tracks-notice">
          No songs on Side ${this.activeSide} yet.<br>Click <strong>Add Song</strong> to add a special melody!
        </div>
      `;
      return;
    }

    sideTracks.forEach((track, index) => {
      const isActive = index === this.currentTrackIndex;
      const item = document.createElement('div');
      item.className = `track-item ${isActive ? 'active' : ''}`;
      
      const isYT = track.source === 'youtube';
      const badgeHtml = isYT 
        ? `<span style="font-size: 0.65rem; background: #dc2626; color: white; padding: 1px 6px; border-radius: 4px; margin-left: 6px; font-weight: 700;">YouTube</span>`
        : '';

      const thumbHtml = track.thumbnail
        ? `<img src="${track.thumbnail}" alt="" style="width: 36px; height: 26px; border-radius: 4px; object-fit: cover; margin-right: 6px;">`
        : '';

      item.innerHTML = `
        <div class="track-left-info">
          <div class="track-num-badge">${isActive ? '▶' : (index + 1)}</div>
          ${thumbHtml}
          <div class="track-titles">
            <div class="track-title">${this._escapeHTML(track.title)} ${badgeHtml}</div>
            <div class="track-artist">${this._escapeHTML(track.artist || 'Unknown Artist')}</div>
          </div>
        </div>
        <div class="track-actions">
          <span class="track-duration">${this._formatTime(track.duration || 180)}</span>
          <button class="icon-btn delete" title="Remove track" data-index="${index}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;

      // Click to play track
      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete')) {
          this._deleteTrack(index);
          return;
        }
        this.currentTrackIndex = index;
        this._renderTracklist();
        this._loadCurrentTrack(true);
      });

      this.tracksContainer.appendChild(item);
    });
  }

  async _loadCurrentTrack(autoPlay = false) {
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (!sideTracks || sideTracks.length === 0) {
      this.memoryTrackTitle.textContent = 'No track loaded';
      this.memoryTrackText.textContent = 'Add songs to this side to play.';
      this.durationLabel.textContent = '0:00';
      return;
    }

    if (this.currentTrackIndex >= sideTracks.length) {
      this.currentTrackIndex = 0;
    }

    const track = sideTracks[this.currentTrackIndex];

    // Update memory card
    this.memoryTrackTitle.textContent = `${track.title} - ${track.artist || ''}`;
    this.memoryTrackText.textContent = track.note ? `"${track.note}"` : '💌 No memory note attached yet.';

    // If track has an IndexedDB stored audio blob
    if (track.source === 'upload' && track.dbKey) {
      const blob = await mixtapeStore.getAudioBlob(track.dbKey);
      if (blob) {
        track.url = URL.createObjectURL(blob);
      }
    }

    this.player.loadTrack(track, autoPlay);
  }

  togglePlay() {
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (!sideTracks || sideTracks.length === 0) {
      this._openAddSongModal();
      return;
    }
    this.player.togglePlay();
  }

  prevTrack() {
    this.player.playMechanicalClick('press');
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (!sideTracks || sideTracks.length === 0) return;

    this.currentTrackIndex--;
    if (this.currentTrackIndex < 0) {
      this.currentTrackIndex = sideTracks.length - 1;
    }
    this._renderTracklist();
    this._loadCurrentTrack(this.player.isPlaying);
  }

  nextTrack() {
    this.player.playMechanicalClick('press');
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (!sideTracks || sideTracks.length === 0) return;

    this.currentTrackIndex++;
    if (this.currentTrackIndex >= sideTracks.length) {
      // Loop or pause at end
      this.currentTrackIndex = 0;
    }
    this._renderTracklist();
    this._loadCurrentTrack(this.player.isPlaying);
  }

  flipTape() {
    this.player.playTapeFlipSound();
    const wasPlaying = this.player.isPlaying;
    if (wasPlaying) {
      this.player.pause();
    }

    this.isFlipped = !this.isFlipped;
    this.cassetteFlipper.classList.toggle('flipped', this.isFlipped);

    // Switch side after half transition
    setTimeout(() => {
      this.activeSide = this.isFlipped ? 'B' : 'A';
      this.currentTrackIndex = 0;
      this._renderTracklist();
      this._loadCurrentTrack(wasPlaying);
    }, 400);
  }

  switchSide(side) {
    if (this.activeSide === side) return;
    this.flipTape();
  }

  _updatePlayState(isPlaying) {
    document.body.classList.toggle('is-playing', isPlaying);
    this.playBtnLabel.textContent = isPlaying ? 'PAUSE' : 'PLAY';

    if (isPlaying) {
      this.btnPlayPause.classList.add('pressed');
      this.playIconSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    } else {
      this.btnPlayPause.classList.remove('pressed');
      this.playIconSvg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
  }

  _updateProgress({ currentTime, duration, progressPercent }) {
    this.currentTimeLabel.textContent = this._formatTime(currentTime);
    this.durationLabel.textContent = this._formatTime(duration);
    this.progressBarFill.style.width = `${progressPercent}%`;

    // Tape Counter (e.g. 042)
    const counterVal = String(Math.floor(currentTime) % 1000).padStart(3, '0');
    if (this.tapeCounter) this.tapeCounter.textContent = counterVal;
    if (this.tapeCounterB) this.tapeCounterB.textContent = counterVal;

    // Physical Tape Spool Thickness Transfer
    // As progress goes from 0% -> 100%, left spool shrinks from 54px to 26px, right spool grows from 26px to 54px
    const leftSize = Math.max(26, 54 - (progressPercent / 100) * 28);
    const rightSize = Math.min(54, 26 + (progressPercent / 100) * 28);

    document.documentElement.style.setProperty('--left-tape-size', `${leftSize}px`);
    document.documentElement.style.setProperty('--right-tape-size', `${rightSize}px`);
  }

  _formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  _escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ================= MODALS & ACTIONS =================

  _openLetterModal() {
    this.letterRecipientHeader.textContent = `To ${this.data.recipient || 'My Favorite Person'},`;
    this.letterBody.textContent = this.data.letter || 'No letter written yet.';
    this.letterSenderSignature.textContent = `With all my love,\n${this.data.sender || 'Alex'}`;
    this.letterModal.classList.add('active');
  }

  _openCustomizeModal() {
    this.inputMixtapeTitle.value = this.data.title || '';
    this.inputRecipient.value = this.data.recipient || '';
    this.inputSender.value = this.data.sender || '';
    this.inputLetter.value = this.data.letter || '';

    // Set theme pill
    this.themePills.querySelectorAll('.radio-pill').forEach(p => {
      p.classList.toggle('selected', p.getAttribute('data-value') === (this.data.theme || 'rose'));
    });

    // Set sticker pill
    this.stickerPills.querySelectorAll('.radio-pill').forEach(p => {
      p.classList.toggle('selected', p.getAttribute('data-value') === (this.data.sticker || 'heart'));
    });

    this.customizeModal.classList.add('active');
  }

  _saveCustomizeModal() {
    this.data.title = this.inputMixtapeTitle.value.trim() || 'Our Special Mixtape ✨';
    this.data.recipient = this.inputRecipient.value.trim() || 'Someone Special';
    this.data.sender = this.inputSender.value.trim() || 'Your Friend';
    this.data.letter = this.inputLetter.value.trim() || '';

    const selectedThemePill = this.themePills.querySelector('.radio-pill.selected');
    if (selectedThemePill) {
      this.data.theme = selectedThemePill.getAttribute('data-value');
    }

    const selectedStickerPill = this.stickerPills.querySelector('.radio-pill.selected');
    if (selectedStickerPill) {
      this.data.sticker = selectedStickerPill.getAttribute('data-value');
    }

    mixtapeStore.saveMixtape(this.data);
    this._renderAll();
    this.customizeModal.classList.remove('active');
  }

  _resetDefaults() {
    if (confirm('Reset mixtape back to sample tracks and love note?')) {
      this.data = mixtapeStore.resetMixtape();
      this._renderAll();
      this.customizeModal.classList.remove('active');
    }
  }

  // ================= YOUTUBE & REAL SONG SEARCH =================

  _extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async _fetchYouTubeMetadata(youtubeUrl) {
    const id = this._extractYouTubeId(youtubeUrl);
    if (!id) return null;
    try {
      // noembed.com provides public CORS-friendly oembed endpoint
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      const data = await res.json();
      return {
        id,
        title: data.title || 'YouTube Song',
        author: data.author_name || 'YouTube Music',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      };
    } catch (e) {
      return {
        id,
        title: 'YouTube Track',
        author: 'YouTube',
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      };
    }
  }

  async _handleFetchYouTube() {
    const url = this.inputYouTubeUrl.value.trim();
    if (!url) return;

    this.btnFetchYT.textContent = 'Fetching...';
    const meta = await this._fetchYouTubeMetadata(url);
    this.btnFetchYT.textContent = 'Fetch Info';

    if (meta) {
      this.currentYouTubeMeta = meta;
      this.inputSongTitle.value = meta.title;
      this.inputSongArtist.value = meta.author;
      this.ytPreviewThumb.src = meta.thumbnail;
      this.ytPreviewTitle.textContent = meta.title;
      this.ytPreviewAuthor.textContent = meta.author;
      this.ytPreviewCard.style.display = 'flex';
    } else {
      alert('Could not find a valid YouTube Video ID from that link. Please check the URL.');
    }
  }

  async _searchRealSongs(query) {
    if (!query || query.trim().length < 2) {
      this.searchResultsList.innerHTML = '<div style="text-align: center; color: #64748b; font-size: 0.8rem; padding: 16px;">Type above to search millions of licensed songs...</div>';
      return;
    }
    this.searchResultsList.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 0.8rem; padding: 12px;">Searching songs...</div>';
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`);
      const data = await res.json();
      this._renderSearchResults(data.results || []);
    } catch (e) {
      this.searchResultsList.innerHTML = '<div style="text-align: center; color: #f87171; font-size: 0.8rem; padding: 12px;">Search unavailable. Check your internet connection.</div>';
    }
  }

  _renderSearchResults(results) {
    if (!results || results.length === 0) {
      this.searchResultsList.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 0.8rem; padding: 12px;">No songs found. Try another search term!</div>';
      return;
    }
    this.searchResultsList.innerHTML = '';
    results.forEach(song => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const artwork = song.artworkUrl60 || song.artworkUrl100 || '';
      item.innerHTML = `
        <img src="${artwork}" alt="" class="search-thumb">
        <div class="search-info">
          <div class="search-track-name">${this._escapeHTML(song.trackName)}</div>
          <div class="search-artist-name">${this._escapeHTML(song.artistName)} • ${this._escapeHTML(song.collectionName || '')}</div>
        </div>
        <button class="search-select-btn">Select</button>
      `;
      item.addEventListener('click', () => {
        this.inputSongTitle.value = song.trackName;
        this.inputSongArtist.value = song.artistName;
        this.selectedRealSong = {
          title: song.trackName,
          artist: song.artistName,
          duration: Math.round((song.trackTimeMillis || 180000) / 1000),
          previewUrl: song.previewUrl,
          thumbnail: song.artworkUrl100 || song.artworkUrl60
        };
        // Highlight selection
        this.searchResultsList.querySelectorAll('.search-result-item').forEach(el => el.style.borderColor = '#334155');
        item.style.borderColor = 'var(--primary-accent)';
      });
      this.searchResultsList.appendChild(item);
    });
  }

  _openAddSongModal() {
    // Reset inputs
    this.inputYouTubeUrl.value = '';
    this.ytPreviewCard.style.display = 'none';
    this.currentYouTubeMeta = null;
    this.selectedRealSong = null;
    this.inputSongSearch.value = '';
    this.searchResultsList.innerHTML = '<div style="text-align: center; color: #64748b; font-size: 0.8rem; padding: 16px;">Type above to search millions of licensed songs...</div>';

    // Default to YouTube tab
    this.sourcePills.querySelectorAll('.radio-pill').forEach(p => {
      p.classList.toggle('selected', p.getAttribute('data-value') === 'youtube');
    });
    this._onSourceChanged('youtube');

    // Populate preset list
    this.presetPickerList.innerHTML = '';
    PRESET_SONGS.forEach((preset, idx) => {
      const choice = document.createElement('div');
      choice.className = `preset-choice ${idx === 0 ? 'selected' : ''}`;
      choice.innerHTML = `
        <div>
          <strong>${preset.title}</strong>
          <div style="font-size: 0.75rem; opacity: 0.75;">${preset.artist}</div>
        </div>
        <span style="font-family: monospace;">${this._formatTime(preset.duration)}</span>
      `;
      choice.addEventListener('click', () => {
        this.presetPickerList.querySelectorAll('.preset-choice').forEach(c => c.classList.remove('selected'));
        choice.classList.add('selected');
        this.inputSongTitle.value = preset.title;
        this.inputSongArtist.value = preset.artist;
        this.inputSongNote.value = preset.note;
        this.selectedPreset = preset;
      });
      this.presetPickerList.appendChild(choice);
    });

    this.inputSongTitle.value = '';
    this.inputSongArtist.value = '';
    this.inputSongNote.value = '';

    this.addSongModal.classList.add('active');
  }

  async _saveNewSong() {
    const selectedSidePill = this.addSidePills.querySelector('.radio-pill.selected');
    const targetSide = selectedSidePill ? selectedSidePill.getAttribute('data-value') : this.activeSide;

    const selectedSourcePill = this.sourcePills.querySelector('.radio-pill.selected');
    const source = selectedSourcePill ? selectedSourcePill.getAttribute('data-value') : 'youtube';

    let title = this.inputSongTitle.value.trim();
    let artist = this.inputSongArtist.value.trim();
    const note = this.inputSongNote.value.trim() || '';

    const newTrack = {
      id: 'trk-' + Date.now(),
      title: title || 'Untitled Track',
      artist: artist || 'Special Artist',
      note,
      duration: 180,
      source
    };

    if (source === 'youtube') {
      const ytUrl = this.inputYouTubeUrl.value.trim();
      const ytId = this._extractYouTubeId(ytUrl);
      if (!ytId) {
        alert('Please paste a valid YouTube video or song link!');
        return;
      }
      newTrack.youtubeId = ytId;
      newTrack.source = 'youtube';
      newTrack.thumbnail = this.currentYouTubeMeta?.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      if (!title && this.currentYouTubeMeta?.title) newTrack.title = this.currentYouTubeMeta.title;
      if (!artist && this.currentYouTubeMeta?.author) newTrack.artist = this.currentYouTubeMeta.author;
    } else if (source === 'search') {
      if (this.selectedRealSong) {
        newTrack.title = this.selectedRealSong.title;
        newTrack.artist = this.selectedRealSong.artist;
        newTrack.duration = this.selectedRealSong.duration;
        newTrack.thumbnail = this.selectedRealSong.thumbnail;
        newTrack.url = this.selectedRealSong.previewUrl;
        newTrack.source = 'url';
      } else {
        alert('Please select a song from the search results!');
        return;
      }
    } else if (source === 'preset') {
      const preset = this.selectedPreset || PRESET_SONGS[0];
      newTrack.url = preset.url;
      newTrack.duration = preset.duration;
      newTrack.proceduralKey = preset.proceduralKey;
    } else if (source === 'url') {
      const url = this.inputAudioUrl.value.trim();
      if (!url) {
        alert('Please provide an audio stream URL!');
        return;
      }
      newTrack.url = url;
    } else if (source === 'upload') {
      const file = this.inputAudioFile.files[0];
      if (!file) {
        alert('Please choose an audio file to upload!');
        return;
      }
      const dbKey = 'blob-' + Date.now();
      await mixtapeStore.saveAudioBlob(dbKey, file);
      newTrack.dbKey = dbKey;
      newTrack.url = URL.createObjectURL(file);
    }

    if (targetSide === 'A') {
      this.data.sideA.push(newTrack);
    } else {
      this.data.sideB.push(newTrack);
    }

    mixtapeStore.saveMixtape(this.data);
    this._renderTracklist();
    this.addSongModal.classList.remove('active');

    // Reset input file
    this.inputAudioFile.value = '';
  }

  _deleteTrack(index) {
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (confirm(`Remove "${sideTracks[index].title}" from Side ${this.activeSide}?`)) {
      const deleted = sideTracks.splice(index, 1)[0];
      if (deleted.dbKey) {
        mixtapeStore.deleteAudioBlob(deleted.dbKey);
      }
      mixtapeStore.saveMixtape(this.data);
      if (this.currentTrackIndex >= sideTracks.length) {
        this.currentTrackIndex = Math.max(0, sideTracks.length - 1);
      }
      this._renderTracklist();
      this._loadCurrentTrack(false);
    }
  }

  _cycleSticker() {
    const stickers = ['heart', 'star', 'flower', 'sparkle', 'cat', 'note'];
    const currentIdx = stickers.indexOf(this.data.sticker || 'heart');
    const nextSticker = stickers[(currentIdx + 1) % stickers.length];
    this.data.sticker = nextSticker;
    mixtapeStore.saveMixtape(this.data);
    this._renderCassetteMetadata();
  }

  _openShareModal() {
    const shareUrl = ShareEngine.encodeToHash(this.data, true);
    this.inputShareLink.value = shareUrl;
    this.copySuccessNotice.style.display = 'none';
    this.shareModal.classList.add('active');
  }

  _copyShareLink() {
    this.inputShareLink.select();
    navigator.clipboard.writeText(this.inputShareLink.value).then(() => {
      this.copySuccessNotice.style.display = 'block';
      setTimeout(() => {
        this.copySuccessNotice.style.display = 'none';
      }, 3000);
    }).catch(() => {
      // Fallback
      document.execCommand('copy');
      this.copySuccessNotice.style.display = 'block';
    });
  }

  async _handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imported = await ShareEngine.importJSON(file);
      this.data = imported;
      mixtapeStore.saveMixtape(this.data);
      this._renderAll();
      this.shareModal.classList.remove('active');
      alert('Mixtape imported successfully! ✨');
    } catch (err) {
      alert('Failed to import mixtape file: ' + err.message);
    }
  }

  // ================= RECIPIENT GIFT MODE OVERLAY =================

  _showGiftOverlay() {
    this.giftRecipientDisplay.textContent = this.data.recipient || 'Someone Special';
    this.giftSubtitleDisplay.innerHTML = `A handmade collection of songs and memories put together just for you by <strong>${this._escapeHTML(this.data.sender || 'Your Friend')}</strong>.`;
    this.giftOverlay.classList.remove('hidden');
  }

  _unwrapGift() {
    this._launchConfetti();
    this.player.playMechanicalClick('press');

    this.giftOverlay.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    this.giftOverlay.style.transform = 'scale(1.1)';
    this.giftOverlay.style.opacity = '0';

    setTimeout(() => {
      this.giftOverlay.classList.add('hidden');
      this.giftOverlay.style.transform = '';
      this._openLetterModal();
      this.togglePlay();
    }, 750);
  }

  _launchConfetti() {
    const colors = ['#f43f5e', '#3b82f6', '#ec4899', '#eab308', '#10b981', '#a855f7'];
    for (let i = 0; i < 40; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `${Math.random() * 40}vh`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3200);
    }
  }
}

// Instantiate app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MixtapeApp();
});
