# 📼 Music Mixtape For You ✨

A personalized, vintage-inspired interactive cassette mixtape web application designed to create, customize, and share music mixtapes for closed ones (friends, partners, family).

## 🌟 Key Features

1. **Realistic Skeuomorphic Cassette Player**:
   - Animated cassette tape with dual spinning spools that rotate during playback.
   - Dynamic magnetic tape ribbon transfer: watch the tape pack shrink on the left spool and expand on the right spool as songs play.
   - Retro mechanical LCD/gear tape counter ticking with playback.
   - **Side A & Side B**: Authentic 3D flip animation (`FLIP SIDE` button) to toggle between two sides of the tape.
   - Satisfying physical mechanical button press sound effects and optional cozy analog tape hiss/warmth via the Web Audio API.

2. **Personalized "For Closed Ones" Experience**:
   - **💌 Dedicated Handwritten Letter**: A fold-out vintage stationery letter with recipient name, heartfelt note, and sender signature.
   - **💌 Track Memories**: Add a personal dedication note to each song (*"Why this song reminds me of you"*). When that track plays, an animated memory card pops up on screen!
   - **Cassette Customization**: Change handwritten tape title, recipient/sender names, and tape stickers (❤️, ⭐, 🌸, ✨, 🐾, 🎵).
   - **5 Aesthetic Themes**:
     - 🌸 *Rose Romance* (Blush pastel & gold)
     - 🌆 *90s Neon* (Cyberpunk retro cassette)
     - 🌙 *Lo-fi Indigo* (Midnight starry tones)
     - 📜 *Vintage Warmth* (Parchment & sepia analog)
     - 🎧 *Modern Slate* (Clean monochrome)

3. **Audio Support**:
   - **Pre-packaged Cozy Melodies**: Includes 5 built-in royalty-free lofi and acoustic melodies plus a built-in procedural synthesizer fallback that works 100% offline.
   - **Local Audio Upload**: Drag-and-drop or select any MP3/WAV/OGG file (safely saved in browser IndexedDB).
   - **Direct Audio Links**: Stream remote audio URLs.

4. **Gift Unboxing Mode & Sharing**:
   - Click **Share Mixtape** to generate a personalized gift link.
   - When opened in **Gift Mode**, your loved one is greeted by an animated sealed airmail envelope with a wax seal.
   - Clicking **OPEN** breaks the wax seal with celebratory confetti, unfolds the personal letter, and begins playing the mixtape!
   - Export and import full mixtape `.json` backups anytime.

---

## 🚀 How to Run

### Method 1: Direct in Any Web Browser
Simply double-click [`index.html`](index.html) to open it in your default web browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local Python Server (Recommended)
Open a terminal in this folder and run:
```bash
python -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000) in your browser.
