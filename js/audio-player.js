// Audio Player Engine with Skeuomorphic Tape Physics & Analog FX
import { ProceduralLofiEngine } from './preset-songs.js?v=2.5';

// Invidious instances (ad-free YouTube proxy) — tried in priority order
const INVIDIOUS_INSTANCES = [
  'https://invidious.tiekoetter.com',
  'https://yt.chocolatemoo53.com',
  'https://invidious.f5.si',
];

export class TapeAudioPlayer {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.crossOrigin = 'anonymous';

    this.audioCtx = null;
    this.mediaSource = null;
    this.hissSource = null;
    this.hissGain = null;
    this.isHissActive = true;
    this.proceduralEngine = null;

    // Invidious iframe player
    this.ytPlayer = null;          // holds the <iframe> DOM element
    this.isYtReady = false;
    this.ytPollInterval = null;
    this._invidiousInstanceIdx = 0;
    this._invidiousDuration = 180;
    this._invidiousCurrentTime = 0;
    this._invidiousState = -1;     // -1 unstarted, 0 ended, 1 playing, 2 paused
    this._playStartWallTime = null;
    this._boundMsgHandler = this._onInvidiousMessage.bind(this);
    window.addEventListener('message', this._boundMsgHandler);

    this.currentTrack = null;
    this.isPlaying = false;
    this.isProceduralActive = false;
    this.volume = 0.85;

    // Callbacks
    this.onPlayStateChange = null; // (isPlaying) => {}
    this.onTimeUpdate = null;      // ({ currentTime, duration, progressPercent }) => {}
    this.onTrackEnded = null;      // () => {}
    this.onError = null;           // (err) => {}

    this._setupAudioListeners();
    this._initInvidiousPlayer();
  }

  // ─── Invidious Iframe Player ─────────────────────────────────────────────

  _invidiousBase() {
    return INVIDIOUS_INSTANCES[this._invidiousInstanceIdx] || INVIDIOUS_INSTANCES[0];
  }

  _buildEmbedUrl(videoId, autoplay = 0) {
    return `${this._invidiousBase()}/embed/${videoId}?autoplay=${autoplay}&controls=1&playsinline=1&enablejsapi=1&rel=0`;
  }

  _initInvidiousPlayer() {
    const el = document.getElementById('ytPlayerElement');
    if (!el) return;

    const iframe = document.createElement('iframe');
    iframe.id = 'invidiousFrame';
    iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:inherit;';
    iframe.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
    iframe.allowFullscreen = true;
    // Load first track in cued (no-autoplay) state
    iframe.src = this._buildEmbedUrl('vGJTaP6anOU', 0);

    el.innerHTML = '';
    el.appendChild(iframe);
    this.ytPlayer = iframe;

    iframe.addEventListener('load', () => {
      this.isYtReady = true;
      // Try to set volume via postMessage
      this._sendCmd('setVolume', [Math.round(this.volume * 100)]);
      if (this.pendingYtTrack) {
        this._loadInvidiousVideo(this.pendingYtTrack.youtubeId, this.pendingYtAutoPlay);
        this.pendingYtTrack = null;
        this.pendingYtAutoPlay = false;
      }
    });

    // Fallback: if iframe fails (e.g. instance blocked), try next instance
    iframe.addEventListener('error', () => this._tryNextInstance());
  }

  _tryNextInstance() {
    this._invidiousInstanceIdx = (this._invidiousInstanceIdx + 1) % INVIDIOUS_INSTANCES.length;
    if (this.currentTrack?.youtubeId) {
      this._loadInvidiousVideo(this.currentTrack.youtubeId, this.isPlaying);
    }
  }

  _loadInvidiousVideo(videoId, autoplay = false) {
    if (!this.ytPlayer) return;
    this._invidiousCurrentTime = 0;
    this._invidiousDuration = this.currentTrack?.duration || 180;
    this._invidiousState = -1;
    this._playStartWallTime = null;
    this.ytPlayer.src = this._buildEmbedUrl(videoId, autoplay ? 1 : 0);
  }

  _sendCmd(func, args = []) {
    if (!this.ytPlayer?.contentWindow) return;
    try {
      this.ytPlayer.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }), '*'
      );
    } catch (_) {}
  }

  _onInvidiousMessage(event) {
    let data;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch (_) { return; }
    if (!data || typeof data !== 'object') return;

    // Invidious fires YouTube-compatible postMessage events
    const info = data.info ?? {};
    let state = null;

    if (data.event === 'infoDelivery') {
      if (typeof info.currentTime === 'number') this._invidiousCurrentTime = info.currentTime;
      if (typeof info.duration === 'number' && info.duration > 0) this._invidiousDuration = info.duration;
      if (typeof info.playerState === 'number') state = info.playerState;
    } else if (data.event === 'onStateChange') {
      state = typeof data.info === 'number' ? data.info : null;
    }

    if (state === null) return;

    const prev = this._invidiousState;
    this._invidiousState = state;

    if (state === 1 && prev !== 1) {          // PLAYING
      this._playStartWallTime = Date.now();
      this.isPlaying = true;
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      this._startYouTubeProgress();
    } else if (state === 2 && prev !== 2) {   // PAUSED
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      this._stopYouTubeProgress();
    } else if (state === 0) {                 // ENDED
      this.isPlaying = false;
      this._stopYouTubeProgress();
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if (this.onTrackEnded) this.onTrackEnded();
    }
  }

  _startYouTubeProgress() {
    this._stopYouTubeProgress();
    this._playStartWallTime = this._playStartWallTime || Date.now();
    const startedAt = this._playStartWallTime;
    const baseTime = this._invidiousCurrentTime;

    this.ytPollInterval = setInterval(() => {
      if (!this.isPlaying) return;
      // Use wall-clock increment from when play started to estimate current time
      const elapsed = (Date.now() - startedAt) / 1000;
      const currentTime = Math.min(baseTime + elapsed, this._invidiousDuration);
      const duration = this._invidiousDuration || this.currentTrack?.duration || 180;
      const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate({ currentTime, duration, progressPercent });
      }
    }, 250);
  }

  _stopYouTubeProgress() {
    if (this.ytPollInterval) {
      clearInterval(this.ytPollInterval);
      this.ytPollInterval = null;
    }
  }

  _initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.proceduralEngine = new ProceduralLofiEngine(this.audioCtx);
      this._setupAnalogHiss();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  _setupAnalogHiss() {
    if (!this.audioCtx) return;
    // Generate gentle cozy analog tape hiss buffer
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    // Pinkish warm noise
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.035;
    }

    this.hissSource = this.audioCtx.createBufferSource();
    this.hissSource.buffer = noiseBuffer;
    this.hissSource.loop = true;

    // Filter to emulate magnetic tape head frequency roll-off
    const hissFilter = this.audioCtx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 2200;
    hissFilter.Q.value = 0.7;

    this.hissGain = this.audioCtx.createGain();
    this.hissGain.gain.value = this.isHissActive ? 0.04 : 0.0;

    this.hissSource.connect(hissFilter);
    hissFilter.connect(this.hissGain);
    this.hissGain.connect(this.audioCtx.destination);
    this.hissSource.start();
  }

  // Authentic mechanical cassette button press click (pure synthesis)
  playMechanicalClick(type = 'press') {
    try {
      this._initAudioContext();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'press' ? 1800 : 900, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'press' ? 320 : 180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.07);

      // Add slight metallic spring ping
      const noise = this.audioCtx.createBufferSource();
      const buffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.04, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
      noise.buffer = buffer;
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);
      noise.start(now);
    } catch (e) {
      // Audio context might fail if blocked by browser policy before first interaction
    }
  }

  // Tape flip / eject clatter sound
  playTapeFlipSound() {
    this.playMechanicalClick('release');
    setTimeout(() => {
      this.playMechanicalClick('press');
    }, 180);
  }

  setHiss(active) {
    this.isHissActive = active;
    if (this.hissGain && this.audioCtx) {
      this.hissGain.gain.setValueAtTime(active ? 0.04 : 0.0, this.audioCtx.currentTime);
    }
  }

  _setupAudioListeners() {
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.isProceduralActive) return;
      const currentTime = this.audioElement.currentTime;
      const duration = this.audioElement.duration || this.currentTrack?.duration || 1;
      const progressPercent = Math.min(100, (currentTime / duration) * 100);
      if (this.onTimeUpdate) {
        this.onTimeUpdate({ currentTime, duration, progressPercent });
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if (this.onTrackEnded) this.onTrackEnded();
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('Audio streaming failed or blocked, falling back to procedural synthesizer...', e);
      this._fallbackToProcedural();
    });
  }

  _fallbackToProcedural() {
    if (!this.isPlaying) return;
    this.isProceduralActive = true;
    this._initAudioContext();
    const key = this.currentTrack?.proceduralKey || 'lofi-midnight';
    this.proceduralEngine.start(key);

    // Procedural virtual progress ticker
    this._startProceduralProgress();
  }

  _startProceduralProgress() {
    this._stopProceduralProgress();
    this.proceduralCurrentTime = 0;
    const duration = this.currentTrack?.duration || 150;
    this.proceduralInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.proceduralCurrentTime += 0.5;
      const progressPercent = Math.min(100, (this.proceduralCurrentTime / duration) * 100);
      if (this.onTimeUpdate) {
        this.onTimeUpdate({
          currentTime: this.proceduralCurrentTime,
          duration,
          progressPercent
        });
      }
      if (this.proceduralCurrentTime >= duration) {
        this._stopProceduralProgress();
        if (this.onTrackEnded) this.onTrackEnded();
      }
    }, 500);
  }

  _stopProceduralProgress() {
    if (this.proceduralInterval) {
      clearInterval(this.proceduralInterval);
      this.proceduralInterval = null;
    }
  }

  loadTrack(track, autoPlay = false) {
    this._initAudioContext();
    this.currentTrack = track;
    this.isProceduralActive = false;
    this._stopProceduralProgress();
    this._stopYouTubeProgress();
    if (this.proceduralEngine) this.proceduralEngine.stop();

    if (track.source === 'youtube' && track.youtubeId) {
      this.audioElement.pause();
      if (this.isYtReady && this.ytPlayer) {
        // Load the Invidious embed for this video
        this._loadInvidiousVideo(track.youtubeId, autoPlay);
        if (autoPlay) {
          this.isPlaying = true;
          if (this.onPlayStateChange) this.onPlayStateChange(true);
          this._startYouTubeProgress();
        } else {
          if (this.onTimeUpdate) {
            this.onTimeUpdate({ currentTime: 0, duration: track.duration || 180, progressPercent: 0 });
          }
        }
      } else {
        // Invidious not ready yet — queue it
        this.pendingYtTrack = track;
        this.pendingYtAutoPlay = autoPlay;
      }
    } else {
      // Regular audio track (preset or uploaded or url)
      // Pause Invidious iframe if it's playing
      if (this.ytPlayer) this._sendCmd('pauseVideo');

      if (track.url) {
        this.audioElement.src = track.url;
        this.audioElement.load();
      } else {
        this.isProceduralActive = true;
      }

      if (autoPlay) {
        this.play();
      } else {
        if (this.onTimeUpdate) {
          this.onTimeUpdate({
            currentTime: 0,
            duration: track.duration || 180,
            progressPercent: 0
          });
        }
      }
    }
  }

  play() {
    this._initAudioContext();
    this.playMechanicalClick('press');
    this.isPlaying = true;

    if (this.currentTrack?.source === 'youtube' && this.currentTrack?.youtubeId) {
      if (this.ytPlayer) {
        this._sendCmd('playVideo');
        this._startYouTubeProgress();
      }
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      return;
    }

    if (this.isProceduralActive || !this.currentTrack?.url) {
      this.isProceduralActive = true;
      const key = this.currentTrack?.proceduralKey || 'lofi-midnight';
      this.proceduralEngine.start(key);
      this._startProceduralProgress();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
      return;
    }

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Playback error, switching to synthetic fallback:', err);
        this._fallbackToProcedural();
        if (this.onPlayStateChange) this.onPlayStateChange(true);
      });
    }
  }

  pause() {
    this.playMechanicalClick('release');
    this.isPlaying = false;

    if (this.currentTrack?.source === 'youtube') {
      this._stopYouTubeProgress();
      if (this.ytPlayer) this._sendCmd('pauseVideo');
    } else if (this.isProceduralActive) {
      this._stopProceduralProgress();
      if (this.proceduralEngine) this.proceduralEngine.stop();
    } else {
      this.audioElement.pause();
    }

    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(percent) {
    if (this.currentTrack?.source === 'youtube') {
      const duration = this._invidiousDuration || this.currentTrack?.duration || 180;
      const targetTime = (percent / 100) * duration;
      // Seek via postMessage
      if (this.ytPlayer) this._sendCmd('seekTo', [targetTime, true]);
      // Sync wall-clock base time for progress tracking
      this._invidiousCurrentTime = targetTime;
      this._playStartWallTime = Date.now();
      if (this.onTimeUpdate) {
        this.onTimeUpdate({ currentTime: targetTime, duration, progressPercent: percent });
      }
      return;
    }

    const duration = this.audioElement.duration || this.currentTrack?.duration || 180;
    const targetTime = (percent / 100) * duration;
    if (this.isProceduralActive) {
      this.proceduralCurrentTime = targetTime;
      if (this.onTimeUpdate) {
        this.onTimeUpdate({ currentTime: targetTime, duration, progressPercent: percent });
      }
    } else if (this.audioElement.duration) {
      this.audioElement.currentTime = targetTime;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audioElement.volume = this.volume;
    // Set volume on Invidious iframe via postMessage
    if (this.ytPlayer) this._sendCmd('setVolume', [Math.round(this.volume * 100)]);
    if (this.proceduralEngine) {
      this.proceduralEngine.setVolume(this.volume);
    }
  }
}
