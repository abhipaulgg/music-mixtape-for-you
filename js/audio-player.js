// Audio Player Engine with Skeuomorphic Tape Physics & Analog FX
import { ProceduralLofiEngine } from './preset-songs.js?v=2.5';

export class TapeAudioPlayer {
  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';

    this.audioCtx = null;
    this.mediaSource = null;
    this.hissSource = null;
    this.hissGain = null;
    this.isHissActive = true;
    this.proceduralEngine = null;

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
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
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

    const hissFilter = this.audioCtx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 2200;
    hissFilter.Q.value = 0.7;

    this.hissGain = this.audioCtx.createGain();
    this.hissGain.gain.value = this.isHissActive ? 0.03 : 0.0;

    this.hissSource.connect(hissFilter);
    hissFilter.connect(this.hissGain);
    this.hissGain.connect(this.audioCtx.destination);
    this.hissSource.start();
  }

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
    } catch (_) {}
  }

  playTapeFlipSound() {
    this.playMechanicalClick('release');
    setTimeout(() => {
      this.playMechanicalClick('press');
    }, 180);
  }

  setHiss(active) {
    this.isHissActive = active;
    if (this.hissGain && this.audioCtx) {
      this.hissGain.gain.setValueAtTime(active ? 0.03 : 0.0, this.audioCtx.currentTime);
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
      console.warn('Audio playback error, falling back to procedural synth:', e);
      this._fallbackToProcedural();
    });
  }

  _fallbackToProcedural() {
    if (!this.isPlaying) return;
    this.isProceduralActive = true;
    this._initAudioContext();
    const key = this.currentTrack?.proceduralKey || 'lofi-midnight';
    this.proceduralEngine.start(key);
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
    if (this.proceduralEngine) this.proceduralEngine.stop();

    if (track.url) {
      this.audioElement.src = track.url;
      this.audioElement.load();
    } else {
      this.isProceduralActive = true;
    }

    if (autoPlay) {
      this.play();
    } else {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if (this.onTimeUpdate) {
        this.onTimeUpdate({
          currentTime: 0,
          duration: track.duration || 180,
          progressPercent: 0
        });
      }
    }
  }

  play() {
    this._initAudioContext();
    this.playMechanicalClick('press');
    this.isPlaying = true;

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

    if (this.isProceduralActive) {
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
    const duration = this.audioElement.duration || this.currentTrack?.duration || 180;
    const targetTime = (percent / 100) * duration;
    if (this.isProceduralActive) {
      this.proceduralCurrentTime = targetTime;
      if (this.onTimeUpdate) {
        this.onTimeUpdate({ currentTime: targetTime, duration, progressPercent: percent });
      }
    } else {
      try {
        this.audioElement.currentTime = targetTime;
      } catch (_) {}
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audioElement.volume = this.volume;
    if (this.proceduralEngine) {
      this.proceduralEngine.setVolume(this.volume);
    }
  }
}
