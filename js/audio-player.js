// Audio Player Engine with Skeuomorphic Tape Physics & Analog FX
import { ProceduralLofiEngine } from './preset-songs.js?v=2.5';

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

    // YouTube Player Support
    this.ytPlayer = null;
    this.isYtReady = false;
    this.ytPollInterval = null;

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
    this._initYouTubeAPI();
  }

  _initYouTubeAPI() {
    // Check if script already added
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        this._setupYTPlayer();
      }
    }, 150);
  }

  _setupYTPlayer() {
    const el = document.getElementById('ytPlayerElement');
    if (!el) return;

    const allYtIds = ['vGJTaP6anOU', 'KKQl-pIRQMY', 'tTPZwlKqawY', 'VKJq7FqYa9c', 'GTrvzcwm7tw', 'Y2zc2IeVX_g', 'qZbdZEFsT3U'];
    this.allYtIds = allYtIds;

    this.ytPlayer = new window.YT.Player('ytPlayerElement', {
      height: '100%',
      width: '100%',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        playsinline: 1,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          this.isYtReady = true;
          this.ytPlayer.setVolume(this.volume * 100);
          
          // Pre-cue the complete 7-song playlist on the player so YouTube treats it as an internal playlist transition
          try {
            if (typeof this.ytPlayer.cuePlaylist === 'function') {
              this.ytPlayer.cuePlaylist({ playlist: this.allYtIds, index: 0, startSeconds: 0 });
            }
          } catch (e) {
            console.warn('Playlist cue failed:', e);
          }

          if (this.pendingYtTrack && this.pendingYtTrack.youtubeId) {
            const trackIdx = this.allYtIds.indexOf(this.pendingYtTrack.youtubeId);
            if (this.pendingYtAutoPlay) {
              if (trackIdx !== -1 && typeof this.ytPlayer.playVideoAt === 'function') {
                this.ytPlayer.playVideoAt(trackIdx);
              } else {
                this.ytPlayer.loadVideoById(this.pendingYtTrack.youtubeId);
              }
              this.play();
            } else {
              if (trackIdx !== -1 && typeof this.ytPlayer.playVideoAt === 'function') {
                // cue at index
              } else {
                this.ytPlayer.cueVideoById(this.pendingYtTrack.youtubeId);
              }
            }
            this.pendingYtTrack = null;
            this.pendingYtAutoPlay = false;
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            if (this.onPlayStateChange) this.onPlayStateChange(true);
            this._startYouTubeProgress();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            if (this.onPlayStateChange) this.onPlayStateChange(false);
            this._stopYouTubeProgress();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this._stopYouTubeProgress();
            if (this.onPlayStateChange) this.onPlayStateChange(false);
            if (this.onTrackEnded) this.onTrackEnded();
          }
        },
        onError: (err) => {
          console.warn('YouTube Player error:', err);
          this._fallbackToProcedural();
        }
      }
    });
  }

  _startYouTubeProgress() {
    this._stopYouTubeProgress();
    this.ytPollInterval = setInterval(() => {
      if (!this.ytPlayer || !this.isPlaying || typeof this.ytPlayer.getCurrentTime !== 'function') return;
      const currentTime = this.ytPlayer.getCurrentTime() || 0;
      const duration = this.ytPlayer.getDuration() || this.currentTrack?.duration || 180;
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

    // If switching from YouTube or to YouTube
    if (track.source === 'youtube' && track.youtubeId) {
      this.audioElement.pause();
      if (this.ytPlayer) {
        const trackIdx = this.allYtIds ? this.allYtIds.indexOf(track.youtubeId) : -1;
        if (autoPlay) {
          if (trackIdx !== -1 && typeof this.ytPlayer.playVideoAt === 'function') {
            this.ytPlayer.playVideoAt(trackIdx);
          } else if (typeof this.ytPlayer.loadVideoById === 'function') {
            this.ytPlayer.loadVideoById(track.youtubeId);
          }
          this.play();
        } else {
          if (typeof this.ytPlayer.cueVideoById === 'function') {
            this.ytPlayer.cueVideoById(track.youtubeId);
          }
        }
      } else {
        // YT not ready yet, queue it
        this.pendingYtTrack = track;
        this.pendingYtAutoPlay = autoPlay;
      }
    } else {
      // Regular audio track (preset or uploaded or url)
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }

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
      if (this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        this.ytPlayer.playVideo();
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
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }
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
      const duration = (this.ytPlayer && typeof this.ytPlayer.getDuration === 'function' && this.ytPlayer.getDuration()) || this.currentTrack?.duration || 180;
      const targetTime = (percent / 100) * duration;
      if (this.ytPlayer && typeof this.ytPlayer.seekTo === 'function') {
        this.ytPlayer.seekTo(targetTime, true);
      }
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
    if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
      try { this.ytPlayer.setVolume(this.volume * 100); } catch (e) {}
    }
    if (this.proceduralEngine) {
      this.proceduralEngine.setVolume(this.volume);
    }
  }
}
