// Main Application Orchestrator
import { TapeAudioPlayer } from './audio-player.js?v=2.5';
import { mixtapeStore } from './mixtape-store.js?v=2.5';
import { ShareEngine } from './share-engine.js?v=2.5';
import { PRESET_SONGS } from './preset-songs.js?v=2.5';
import { authManager } from './auth-manager.js?v=3.0';

class MixtapeApp {
  constructor() {
    this.player = new TapeAudioPlayer();
    this.data = mixtapeStore.loadMixtape();
    this.activeSide = 'A';
    this.currentTrackIndex = 0;
    this.isFlipped = false;
    this.isRecipientMode = false;

    this._checkURLParameters();
    this._cacheDOMElements();
    this._initEventListeners();
    this._renderAll();
  }

  _checkURLParameters() {
    const urlData = ShareEngine.decodeFromURL();
    if (urlData && urlData.data) {
      this.isRecipientMode = true;
      this.data = {
        ...this.data,
        ...urlData.data,
        id: 'shared-' + Date.now()
      };
      // If shared in gift mode, trigger the gift overlay
      if (urlData.isGift) {
        this.startInGiftMode = true;
      }
    } else {
      this.isRecipientMode = false;
    }
  }

  _cacheDOMElements() {
    // Header & Brand
    this.brandHomeBtn = document.getElementById('brandHomeBtn');
    this.headerSubtitle = document.getElementById('headerSubtitle');
    this.btnCreateMixtape = document.getElementById('btnCreateMixtape');
    this.btnOpenLetter = document.getElementById('btnOpenLetter');
    this.btnOpenCustomize = document.getElementById('btnOpenCustomize');
    this.btnOpenAddSong = document.getElementById('btnOpenAddSong');
    this.btnOpenShare = document.getElementById('btnOpenShare');

    // Google Auth & User Profile Chip
    this.googleSignInBtn = document.getElementById('googleSignInBtn');
    this.userProfileChip = document.getElementById('userProfileChip');
    this.userAvatar = document.getElementById('userAvatar');
    this.userNameText = document.getElementById('userNameText');
    this.btnOpenMyMixtapes = document.getElementById('btnOpenMyMixtapes');
    this.btnSignOut = document.getElementById('btnSignOut');

    // Creator Sections & Hero
    this.creatorHero = document.querySelector('.creator-hero');
    this.sectionCardNames = document.getElementById('sectionCardNames');
    this.sectionCardColors = document.getElementById('sectionCardColors');
    this.sectionCardLetter = document.getElementById('sectionCardLetter');
    this.sectionCardTracklist = document.getElementById('sectionCardTracklist');
    this.sectionCardLock = document.getElementById('sectionCardLock');
    this.btnLockAndShare = document.getElementById('btnLockAndShare');
    this.recipientOverviewCard = document.getElementById('recipientOverviewCard');
    this.recipientOverviewText = document.getElementById('recipientOverviewText');
    this.btnRecipientReadLetter = document.getElementById('btnRecipientReadLetter');

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

    // My Saved Mixtapes Modal
    this.myMixtapesModal = document.getElementById('myMixtapesModal');
    this.btnCloseMyMixtapes = document.getElementById('btnCloseMyMixtapes');
    this.btnDoneMyMixtapes = document.getElementById('btnDoneMyMixtapes');
    this.myMixtapesList = document.getElementById('myMixtapesList');

    // Creator Studio / Customize Modal
    this.customizeModal = document.getElementById('customizeModal');
    this.btnCloseCustomize = document.getElementById('btnCloseCustomize');
    this.modalStudioTitle = document.getElementById('modalStudioTitle');
    this.studioStepTabs = document.getElementById('studioStepTabs');
    this.stepContent1 = document.getElementById('stepContent1');
    this.stepContent2 = document.getElementById('stepContent2');
    this.stepContent3 = document.getElementById('stepContent3');
    this.stepContent4 = document.getElementById('stepContent4');
    this.inputMixtapeTitle = document.getElementById('inputMixtapeTitle');
    this.inputRecipient = document.getElementById('inputRecipient');
    this.inputSender = document.getElementById('inputSender');
    this.inputLetter = document.getElementById('inputLetter');
    this.themePills = document.getElementById('themePills');
    this.stickerPills = document.getElementById('stickerPills');
    this.inputStudioShareLink = document.getElementById('inputStudioShareLink');
    this.btnStudioCopyLink = document.getElementById('btnStudioCopyLink');
    this.studioCopySuccess = document.getElementById('studioCopySuccess');
    this.btnStudioWhatsApp = document.getElementById('btnStudioWhatsApp');
    this.btnStudioPreviewGift = document.getElementById('btnStudioPreviewGift');
    this.btnStudioPrev = document.getElementById('btnStudioPrev');
    this.btnStudioNext = document.getElementById('btnStudioNext');
    this.btnResetDefaults = document.getElementById('btnResetDefaults');
    this.currentStudioStep = 1;

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
    this.btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
    this.btnPreviewGift = document.getElementById('btnPreviewGift');
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

    // Click memory card to edit current song note (only in creator mode)
    this.memoryCard.addEventListener('click', () => {
      if (!this.isRecipientMode) {
        this._editTrackNote(this.currentTrackIndex);
      }
    });

    // Home / Brand click
    this.brandHomeBtn?.addEventListener('click', () => {
      if (window.location.hash || window.location.search) {
        window.location.href = window.location.origin + window.location.pathname;
      }
    });

    // Modals open/close
    this.btnOpenLetter.addEventListener('click', () => this._openLetterModal());
    this.btnCloseLetter.addEventListener('click', () => this.letterModal.classList.remove('active'));
    this.btnRecipientReadLetter?.addEventListener('click', () => this._openLetterModal());

    // Google Auth & Saved Library
    authManager.onAuthStateChanged = (user) => this._renderAuthState(user);
    this._renderAuthState(authManager.user);

    this.btnSignOut?.addEventListener('click', () => authManager.signOut());
    this.btnOpenMyMixtapes?.addEventListener('click', () => this._openMyMixtapesModal());
    this.btnCloseMyMixtapes?.addEventListener('click', () => this.myMixtapesModal.classList.remove('active'));
    this.btnDoneMyMixtapes?.addEventListener('click', () => this.myMixtapesModal.classList.remove('active'));

    // Lock In & Share CTA
    this.btnLockAndShare?.addEventListener('click', () => this._handleLockAndShare());

    // Create a Mixtape button in header (if present)
    this.btnCreateMixtape?.addEventListener('click', () => this._openCreatorStudio(1));

    // Customize button in header (if present)
    this.btnOpenCustomize?.addEventListener('click', () => this._openCreatorStudio(1));
    this.btnCloseCustomize?.addEventListener('click', () => this.customizeModal.classList.remove('active'));
    this.btnResetDefaults?.addEventListener('click', () => this._resetDefaults());

    // Live Real-Time Updating as user types in Creator Studio
    this.inputMixtapeTitle?.addEventListener('input', () => {
      const val = this.inputMixtapeTitle.value.trim() || 'Our Special Mixtape ✨';
      this.data.title = val;
      this.cassetteTitleTexts.forEach(el => el.textContent = val);
      mixtapeStore.saveMixtape(this.data);
    });

    this.inputRecipient?.addEventListener('input', () => {
      const rec = this.inputRecipient.value.trim() || 'Someone Special';
      this.data.recipient = rec;
      this.headerSubtitle.textContent = `For ${rec} • From ${this.data.sender || 'Your Friend'} ❤️`;
      mixtapeStore.saveMixtape(this.data);
    });

    this.inputSender?.addEventListener('input', () => {
      const snd = this.inputSender.value.trim() || 'Your Friend';
      this.data.sender = snd;
      this.headerSubtitle.textContent = `For ${this.data.recipient || 'Someone Special'} • From ${snd} ❤️`;
      mixtapeStore.saveMixtape(this.data);
    });

    this.inputLetter?.addEventListener('input', () => {
      this.data.letter = this.inputLetter.value;
      mixtapeStore.saveMixtape(this.data);
    });

    // Studio Wizard Steps navigation (if modal used)
    this.studioStepTabs?.addEventListener('click', (e) => {
      const btn = e.target.closest('.studio-tab-btn');
      if (btn) {
        const step = parseInt(btn.getAttribute('data-step'), 10);
        this._goToStudioStep(step);
      }
    });

    this.btnStudioNext.addEventListener('click', () => {
      if (this.currentStudioStep < 4) {
        this._goToStudioStep(this.currentStudioStep + 1);
      } else {
        // Step 4 "Done & Listen"
        this.customizeModal.classList.remove('active');
      }
    });

    this.btnStudioPrev.addEventListener('click', () => {
      if (this.currentStudioStep > 1) {
        this._goToStudioStep(this.currentStudioStep - 1);
      }
    });

    // Studio Copy & WhatsApp Buttons
    this.btnStudioCopyLink.addEventListener('click', () => {
      this.inputStudioShareLink.select();
      navigator.clipboard.writeText(this.inputStudioShareLink.value).then(() => {
        this.studioCopySuccess.style.display = 'block';
        setTimeout(() => this.studioCopySuccess.style.display = 'none', 3000);
      });
    });

    this.btnStudioWhatsApp.addEventListener('click', () => {
      this._shareOnWhatsApp(this.inputStudioShareLink.value);
    });

    this.btnStudioPreviewGift.addEventListener('click', () => {
      this._testRecipientUnboxing();
    });

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
    this.btnShareWhatsApp.addEventListener('click', () => this._shareOnWhatsApp());
    this.btnPreviewGift.addEventListener('click', () => this._testRecipientUnboxing());
    this.btnDownloadJSON.addEventListener('click', () => ShareEngine.downloadJSON(this.data));
    this.inputImportJSON.addEventListener('change', (e) => this._handleImportJSON(e));

    // Sticker click on tape
    this.stickerBadgeA.addEventListener('click', () => this._cycleSticker());
    this.stickerBadgeB.addEventListener('click', () => this._cycleSticker());

    // Gift unwrap button
    this.btnBreakSeal.addEventListener('click', () => this._unwrapGift());

    // Initialize pill selection behavior with live updates
    this._setupPills(this.themePills, (theme) => {
      this.data.theme = theme;
      this._applyTheme(theme);
      mixtapeStore.saveMixtape(this.data);
    });

    this._setupPills(this.stickerPills, (sticker) => {
      this.data.sticker = sticker;
      this._renderCassetteMetadata();
      mixtapeStore.saveMixtape(this.data);
    });

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
    this._applyModeView();
    this._renderTracklist();
    this._loadCurrentTrack(false);

    if (this.startInGiftMode) {
      this._showGiftOverlay();
    }
  }

  _applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  _applyModeView() {
    if (this.isRecipientMode) {
      document.body.classList.add('recipient-mode');
      if (this.creatorHero) this.creatorHero.style.display = 'none';
      if (this.sectionCardNames) this.sectionCardNames.style.display = 'none';
      if (this.sectionCardColors) this.sectionCardColors.style.display = 'none';
      if (this.sectionCardLetter) this.sectionCardLetter.style.display = 'none';
      if (this.sectionCardLock) this.sectionCardLock.style.display = 'none';
      if (this.btnOpenAddSong) this.btnOpenAddSong.style.display = 'none';

      if (this.recipientOverviewCard) {
        this.recipientOverviewCard.style.display = 'block';
        const tapeTitle = this.data.title || 'Our Special Mixtape';
        const sender = this.data.sender || 'Someone Special';
        const recipient = this.data.recipient || 'You';
        if (this.recipientOverviewText) {
          this.recipientOverviewText.innerHTML = `<strong>"${this._escapeHTML(tapeTitle)}"</strong><br>A personalized collection curated with love by <strong>${this._escapeHTML(sender)}</strong> for <strong>${this._escapeHTML(recipient)}</strong>. Put on your headphones, press play, and enjoy! ✨`;
        }
      }
    } else {
      document.body.classList.remove('recipient-mode');
      if (this.creatorHero) this.creatorHero.style.display = 'block';
      if (this.sectionCardNames) this.sectionCardNames.style.display = 'block';
      if (this.sectionCardColors) this.sectionCardColors.style.display = 'block';
      if (this.sectionCardLetter) this.sectionCardLetter.style.display = 'block';
      if (this.sectionCardLock) this.sectionCardLock.style.display = 'flex';
      if (this.btnOpenAddSong) this.btnOpenAddSong.style.display = 'inline-flex';
      if (this.recipientOverviewCard) this.recipientOverviewCard.style.display = 'none';

      this._populateCreatorInputs();
    }
  }

  _populateCreatorInputs() {
    if (this.inputMixtapeTitle) this.inputMixtapeTitle.value = this.data.title || '';
    if (this.inputRecipient) this.inputRecipient.value = this.data.recipient || '';
    if (this.inputSender) this.inputSender.value = this.data.sender || '';
    if (this.inputLetter) this.inputLetter.value = this.data.letter || '';

    if (this.themePills) {
      this.themePills.querySelectorAll('.radio-pill').forEach(p => {
        p.classList.toggle('selected', p.getAttribute('data-value') === (this.data.theme || 'rose'));
      });
    }

    if (this.stickerPills) {
      this.stickerPills.querySelectorAll('.radio-pill').forEach(p => {
        p.classList.toggle('selected', p.getAttribute('data-value') === (this.data.sticker || 'heart'));
      });
    }
  }

  _renderCassetteMetadata() {
    const title = this.data.title || 'Our Mixtape';
    this.cassetteTitleTexts.forEach(el => el.textContent = title);

    const recipient = this.data.recipient || 'Someone Special';
    const sender = this.data.sender || 'Your Friend';
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
          No songs on Side ${this.activeSide} yet.<br>${!this.isRecipientMode ? 'Click <strong>Add Song</strong> to add a special melody!' : 'Empty side.'}
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
          ${!this.isRecipientMode ? `
            <button class="icon-btn edit-note" title="Edit personal note for this song" data-index="${index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="icon-btn delete" title="Remove track" data-index="${index}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : ''}
        </div>
      `;

      // Click to play track or edit
      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete')) {
          this._deleteTrack(index);
          return;
        }
        if (e.target.closest('.edit-note')) {
          this._editTrackNote(index);
          return;
        }
        this.currentTrackIndex = index;
        this._renderTracklist();
        this._loadCurrentTrack(true);
      });

      this.tracksContainer.appendChild(item);
    });
  }

  _editTrackNote(index) {
    const sideTracks = this.activeSide === 'A' ? this.data.sideA : this.data.sideB;
    if (!sideTracks || !sideTracks[index]) return;
    const track = sideTracks[index];
    const newNote = prompt(`💌 Edit your personal memory note for "${track.title}":`, track.note || '');
    if (newNote !== null) {
      track.note = newNote.trim();
      mixtapeStore.saveMixtape(this.data);
      this._loadCurrentTrack(this.player.isPlaying);
    }
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
    this.letterSenderSignature.textContent = `With all my love,\n${this.data.sender || 'Your Friend'}`;
    this.letterModal.classList.add('active');
  }

  _openCreatorStudio(startStep = 1) {
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

    this._goToStudioStep(startStep);
    this.customizeModal.classList.add('active');
  }

  _goToStudioStep(step) {
    this.currentStudioStep = Math.max(1, Math.min(4, step));

    // Toggle tabs
    this.studioStepTabs.querySelectorAll('.studio-tab-btn').forEach(btn => {
      const btnStep = parseInt(btn.getAttribute('data-step'), 10);
      btn.classList.toggle('active', btnStep === this.currentStudioStep);
    });

    // Toggle step contents
    this.stepContent1.style.display = this.currentStudioStep === 1 ? 'block' : 'none';
    this.stepContent2.style.display = this.currentStudioStep === 2 ? 'block' : 'none';
    this.stepContent3.style.display = this.currentStudioStep === 3 ? 'block' : 'none';
    this.stepContent4.style.display = this.currentStudioStep === 4 ? 'block' : 'none';

    // Toggle Back button
    this.btnStudioPrev.style.display = this.currentStudioStep > 1 ? 'block' : 'none';

    // Toggle Next / Finish button label
    if (this.currentStudioStep === 4) {
      this.btnStudioNext.textContent = 'Done & Listen 🎵';
      // Generate link into the studio input
      const link = ShareEngine.encodeToHash(this.data, true);
      this.inputStudioShareLink.value = link;
      this.studioCopySuccess.style.display = 'none';
    } else {
      this.btnStudioNext.textContent = 'Next →';
    }
  }

  _openCustomizeModal() {
    this._openCreatorStudio(1);
  }

  _shareOnWhatsApp(customLink) {
    const link = customLink || ShareEngine.encodeToHash(this.data, true);
    const title = this.data.title || 'Our Special Mixtape';
    const recipient = this.data.recipient || 'My Favorite Person';
    const sender = this.data.sender || 'Your Friend';
    const text = `Hey ${recipient}! I made a special music mixtape just for you: "${title}" 📼✨\n\nTap here to unwrap your gift:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  _testRecipientUnboxing() {
    this.customizeModal.classList.remove('active');
    this.shareModal.classList.remove('active');
    this._showGiftOverlay();
  }

  _resetDefaults() {
    if (confirm('Reset mixtape back to sample tracks and love note?')) {
      this.data = mixtapeStore.resetMixtape();
      this._renderAll();
      this._openCreatorStudio(1);
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

  // ================= GOOGLE AUTH & USER MIXTAPE LIBRARY =================

  _renderAuthState(user) {
    if (user) {
      if (this.googleSignInBtn) this.googleSignInBtn.style.display = 'none';
      if (this.userProfileChip) {
        this.userProfileChip.style.display = 'flex';
        if (this.userAvatar) this.userAvatar.src = user.avatar || '';
        if (this.userNameText) this.userNameText.textContent = user.name || 'My Account';
      }
      // If creator's sender name is default or empty, prefill with user's name
      if (!this.data.sender || this.data.sender === 'Your Closest Friend' || this.data.sender === 'Alex' || this.data.sender === 'Your Friend') {
        this.data.sender = user.name.split(' ')[0] || user.name;
        if (this.inputSender) this.inputSender.value = this.data.sender;
        this._renderCassetteMetadata();
        mixtapeStore.saveMixtape(this.data);
      }
    } else {
      if (this.googleSignInBtn) this.googleSignInBtn.style.display = 'block';
      if (this.userProfileChip) this.userProfileChip.style.display = 'none';
    }
  }

  _openMyMixtapesModal() {
    this._renderMyMixtapesList();
    this.myMixtapesModal.classList.add('active');
  }

  _renderMyMixtapesList() {
    if (!this.myMixtapesList) return;
    const tapes = authManager.getUserMixtapes();
    this.myMixtapesList.innerHTML = '';

    if (!tapes || tapes.length === 0) {
      this.myMixtapesList.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 24px 12px; font-size: 0.9rem;">
          No saved mixtapes yet.<br>Customize your tape and click <strong>"Lock In & Generate Share Link"</strong> to save it here! ✨
        </div>
      `;
      return;
    }

    tapes.forEach(tape => {
      const card = document.createElement('div');
      card.className = 'saved-mixtape-card';
      const songCount = ((tape.sideA || []).length + (tape.sideB || []).length);
      const dateStr = tape.updatedAt ? new Date(tape.updatedAt).toLocaleDateString() : 'Recently';

      card.innerHTML = `
        <div class="saved-tape-meta">
          <div class="saved-tape-title">${this._escapeHTML(tape.title || 'Untitled Mixtape')}</div>
          <div class="saved-tape-sub">For: ${this._escapeHTML(tape.recipient || 'Someone Special')} • ${songCount} songs • ${dateStr}</div>
        </div>
        <div class="saved-tape-actions">
          <button class="btn btn-primary btn-sm btn-load-tape" title="Open and edit this mixtape">Open & Edit</button>
          <button class="btn btn-secondary btn-sm btn-copy-saved-link" title="Copy share link">Copy Link</button>
          <button class="icon-btn btn-delete-saved" title="Delete from saved library" style="color: #f43f5e;">🗑️</button>
        </div>
      `;

      // Wire Open & Edit
      card.querySelector('.btn-load-tape').addEventListener('click', () => {
        this.data = JSON.parse(JSON.stringify(tape));
        mixtapeStore.saveMixtape(this.data);
        this.isRecipientMode = false;
        this._applyModeView();
        this._renderAll();
        this.myMixtapesModal.classList.remove('active');
      });

      // Wire Copy Link
      card.querySelector('.btn-copy-saved-link').addEventListener('click', () => {
        const link = ShareEngine.encodeToHash(tape, true);
        navigator.clipboard.writeText(link).then(() => {
          alert('Mixtape link copied to clipboard! ✨');
        });
      });

      // Wire Delete
      card.querySelector('.btn-delete-saved').addEventListener('click', () => {
        if (confirm(`Delete "${tape.title}" from your library?`)) {
          authManager.deleteMixtapeFromLibrary(tape.id);
          this._renderMyMixtapesList();
        }
      });

      this.myMixtapesList.appendChild(card);
    });
  }

  _handleLockAndShare() {
    let isSaved = false;
    if (authManager.user) {
      isSaved = authManager.saveMixtapeToLibrary(this.data);
    }
    this._openShareModal(isSaved);
  }

  _openShareModal(savedToLibrary = false) {
    const shareUrl = ShareEngine.encodeToHash(this.data, true);
    this.inputShareLink.value = shareUrl;
    this.copySuccessNotice.style.display = 'none';

    let noticeEl = document.getElementById('shareModalNoticeBox');
    if (!noticeEl) {
      noticeEl = document.createElement('div');
      noticeEl.id = 'shareModalNoticeBox';
      noticeEl.style.cssText = 'font-size: 0.85rem; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; line-height: 1.4;';
      const container = this.inputShareLink.closest('.form-group');
      if (container && container.parentNode) {
        container.parentNode.insertBefore(noticeEl, container);
      }
    }

    if (authManager.user) {
      noticeEl.style.background = 'rgba(16, 185, 129, 0.15)';
      noticeEl.style.border = '1px solid rgba(16, 185, 129, 0.4)';
      noticeEl.style.color = '#34d399';
      noticeEl.innerHTML = `✓ <strong>Saved to your Google Library!</strong> You can revisit and edit this tape anytime from "My Mixtapes". When recipients open your link, it will be sealed as a gift.`;
    } else {
      noticeEl.style.background = 'rgba(244, 63, 94, 0.12)';
      noticeEl.style.border = '1px solid rgba(244, 63, 94, 0.35)';
      noticeEl.style.color = '#fca5a5';
      noticeEl.innerHTML = `🔒 <strong>Guest Link Sealed:</strong> Once shared, this mixtape is locked and cannot be edited. <br><em>Tip: Sign in with Google at top right to save and edit this mixtape anytime!</em>`;
    }

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
