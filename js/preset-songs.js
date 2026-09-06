// Preset royalty-free cozy tracks for the mixtape
// Features reliable streaming sources with procedural Web Audio lofi music fallback

export const PRESET_SONGS = [
  {
    id: 'preset-1',
    title: 'Midnight Starlight (Lo-fi)',
    artist: 'Coffee & Stardust',
    note: 'Remember when we stayed up until 3 AM just talking about the universe? This was playing in my head the whole time.',
    duration: 145,
    source: 'preset',
    url: 'https://cdn.freesound.org/previews/557/557813_9396781-lq.mp3',
    proceduralKey: 'lofi-midnight'
  },
  {
    id: 'preset-2',
    title: 'Warm Autumn Breeze (Acoustic)',
    artist: 'Golden Hour Memories',
    note: 'For the quiet afternoons walking through the park and sipping hot chai together.',
    duration: 160,
    source: 'preset',
    url: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
    proceduralKey: 'warm-breeze'
  },
  {
    id: 'preset-3',
    title: 'Raindrops on the Window',
    artist: 'Nostalgia Club',
    note: 'Every time it rains, I smile thinking about how we got completely drenched that day and laughed uncontrollably.',
    duration: 175,
    source: 'preset',
    url: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3',
    proceduralKey: 'rainy-day'
  },
  {
    id: 'preset-4',
    title: 'Letters I Never Sent',
    artist: 'Velvet Strings',
    note: 'Some feelings are hard to put into plain words, so I put them into music instead.',
    duration: 150,
    source: 'preset',
    url: 'https://cdn.freesound.org/previews/495/495764_10672153-lq.mp3',
    proceduralKey: 'letters'
  },
  {
    id: 'preset-5',
    title: 'Sunset Drive With You',
    artist: 'Dreamcatcher',
    note: 'Roll the windows down, let the wind mess up your hair. This one is for our next road trip!',
    duration: 168,
    source: 'preset',
    url: 'https://cdn.freesound.org/previews/530/530703_11861866-lq.mp3',
    proceduralKey: 'sunset-drive'
  }
];

// Procedural Lo-fi Synthesizer fallback
// Generates warm, nostalgic Rhodes-like chords & gentle lofi beats via Web Audio API
export class ProceduralLofiEngine {
  constructor(audioCtx) {
    this.ctx = audioCtx;
    this.isPlaying = false;
    this.intervalId = null;
    this.step = 0;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.value = 0.45;
    this.gainNode.connect(this.ctx.destination);
  }

  // Cozy chord progressions (frequencies in Hz)
  getChords(key) {
    const chordBook = {
      'lofi-midnight': [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ],
      'warm-breeze': [
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [329.63, 392.00, 493.88, 587.33], // Em7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [261.63, 329.63, 392.00, 493.88]  // Cmaj7
      ],
      'rainy-day': [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [196.00, 246.94, 293.66, 349.23]  // G7
      ],
      'letters': [
        [293.66, 370.00, 440.00, 554.37], // Dmaj7
        [246.94, 293.66, 370.00, 440.00], // Bm7
        [196.00, 246.94, 293.66, 370.00], // Gmaj7
        [220.00, 277.18, 329.63, 392.00]  // A7
      ],
      'sunset-drive': [
        [261.63, 329.63, 392.00, 523.25], // C
        [196.00, 246.94, 293.66, 392.00], // G
        [220.00, 261.63, 329.63, 440.00], // Am
        [174.61, 220.00, 261.63, 349.23]  // F
      ]
    };
    return chordBook[key] || chordBook['lofi-midnight'];
  }

  playNote(freq, startTime, duration = 2.0, type = 'sine', vel = 0.3) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Warm vintage lowpass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, startTime);
    filter.Q.setValueAtTime(2, startTime);

    // ADSR Envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(vel, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(vel * 0.4, startTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  // Warm gentle bass kick
  playKick(startTime) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(110, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.2);
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
    osc.connect(gain);
    gain.connect(this.gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.26);
  }

  // Subtle vinyl crackle / brush snare
  playSnare(startTime) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.15;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);
    noise.start(startTime);
  }

  start(key = 'lofi-midnight') {
    this.isPlaying = true;
    const chords = this.getChords(key);
    this.step = 0;

    const playBar = () => {
      if (!this.isPlaying) return;
      const now = this.ctx.currentTime + 0.05;
      const currentChord = chords[this.step % chords.length];

      // Play soft arpeggiated piano/epiano chord notes
      currentChord.forEach((f, idx) => {
        this.playNote(f, now + idx * 0.05, 2.8, 'triangle', 0.18);
        this.playNote(f * 0.5, now, 2.5, 'sine', 0.22); // bass note
      });

      // Subtle rhythm
      this.playKick(now);
      this.playSnare(now + 0.9);
      this.playKick(now + 1.4);
      this.playSnare(now + 1.8);

      this.step++;
    };

    playBar();
    this.intervalId = setInterval(playBar, 2200);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setVolume(vol) {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(vol * 0.5, this.ctx.currentTime);
    }
  }
}
