# ✋ Gestural — Hand & Face Tracking CGI Effects

A browser-based interactive graphics app where your **hand** and **face** — captured live via webcam — control cinematic CGI effects in real time. No backend, no install, no dependencies. Pure browser magic.

<p align="center">
  <img src="https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/MediaPipe-00A98F?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Canvas_2D-333?style=for-the-badge" />
</p>

---

## 🎥 Demo

Open `index.html` in Chrome/Edge → grant camera → move your hand or show your face → enjoy.

---

## ✨ Features

### 🖐️ Hand Tracking (3 Modes)
| Mode | Effect | Gesture Triggers |
|------|--------|-----------------|
| **Particles** | HSL-cycling particle trails follow your index finger | Pinch → 40-particle burst |
| **Waves** | Expanding glowing rings at fingertip | Open palm → rings from all 5 fingertips |
| **Ink** | Ink diffusion on a 40×30 grid (blue → gold) | Pinch → 5×5 ink splat |

### 😎 Face Tracking CGI (5 Modes)
| Mode | Effect | Expression Triggers |
|------|--------|-------------------|
| **Mesh** | Sci-fi HUD wireframe overlay, sweeping scanline, nose crosshair, corner brackets | Mouth open → magenta shift; Brow raise → extra scanline |
| **Aura** | Multi-layered energy field with perimeter particles and electric arc flashes | Mouth → gold; Brow → white-hot; Head move → field expands |
| **Halo** | 120 bioluminescent orbital particles in 3 depth layers | Blink → eye burst; Mouth → speed+gold shift; Brow → crown burst |
| **Glitch** | Chromatic aberration, glitch scan bars, fake biometric text readout | Mouth → garbled text + 3x glitch; Blink → white flash |
| **Portal** | Cosmic portal ring with star field clipped to face, warp tendrils, spiraling particles | Mouth → portal expands; Blink → star flicker; Brow → blue shift |

### 🎛️ Layer System
- **Hand + Face effects run simultaneously** — pick one from each row
- Independent ON/OFF toggles for each layer
- Keyboard shortcuts: `1-3` hand modes, `4-8` face modes, `0` all off

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/BeleRohit/hand-tracking.git
cd hand-tracking

# Open (no build step!)
open index.html        # macOS
# or
start index.html       # Windows
# or
xdg-open index.html    # Linux
```

> **Requirements:** Chrome or Edge (MediaPipe works best there). Webcam required.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Hand tracking | [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands) — 21 landmarks, 10-frame smoothing |
| Face tracking | [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) — 468 landmarks, expression detection |
| Rendering | [p5.js](https://p5js.org/) + Canvas 2D — 60fps render loop |
| CV throttle | 20fps shared pipeline for both hand + face |
| Language | Vanilla JavaScript — zero build tools, zero frameworks |

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| `1` / `2` / `3` | Switch hand effect (Particles / Waves / Ink) |
| `4` / `5` / `6` / `7` / `8` | Switch face effect (Mesh / Aura / Halo / Glitch / Portal) |
| `0` | Turn off all effects |
| **Pinch** (thumb + index close) | Burst / splat effect (hand modes) |
| **Open palm** (all fingers spread) | Multi-point effect (Waves mode) |
| **Mouth open** | Color shifts, speed changes, glitch amplification |
| **Blink** | Particle bursts from eyes, flash effects |
| **Eyebrow raise** | Crown bursts, extra scanlines, color shifts |

---

## 📁 Project Structure

```
hand-tracking/
├── index.html    ← entire app (single file, ~770 lines)
├── .gitignore
└── README.md
```

Yes, it's **one file**. HTML + CSS + JS, all inlined. Open and it works.

---

## ⚡ Performance

- MediaPipe CV runs at **20fps** (throttled), p5.js renders at **60fps** (interpolated)
- Particle pool capped at **500** (oldest culled)
- Ring pool capped at **30**
- Face effects gracefully fade over 20 frames when face leaves view
- No memory leaks — dead particles/rings always removed

---

## 🛡️ Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Fully supported |
| Edge | ✅ Fully supported |
| Firefox | ⚠️ MediaPipe may have limited support |
| Safari | ❌ Not supported (WebAssembly SIMD limitations) |

---

## 📄 License

MIT

---

<p align="center">
  Built with 🖐️ + 😎 by <a href="https://github.com/BeleRohit">Rohit Bele</a>
</p>
