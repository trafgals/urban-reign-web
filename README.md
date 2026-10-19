![Urban Reign Redux](docs/assets/logo.png)

# Urban Reign Web & Redux 0.4

[![Deploy to GitHub Pages](https://github.com/trafgals/urban-reign-web/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/trafgals/urban-reign-web/actions/workflows/deploy-pages.yml)
[![Tests](https://img.shields.io/badge/tests-5%20passed-brightgreen)](file:///c:/code/trafgals/urban-reign-web/test)
[![WebGPU](https://img.shields.io/badge/WebGPU-hardware%2060fps-orange)](https://trafgals.github.io/urban-reign-web/)

Hardware-accelerated 60Hz WebAssembly browser ports for **Urban Reign** (Namco, 2005) and **Urban Reign Redux 0.4** (community mod by **Jasonafex**).

Play instantly in any modern browser (Google Chrome, Microsoft Edge, Safari) with WebGPU enabled — zero installs, zero plugins.

---

## 🎮 Play in Browser (Live Sites)

| Edition | Description | Status & Link | Disc Storage | Soundtrack |
| :--- | :--- | :--- | :--- | :--- |
| **Urban Reign Redux 0.4** | Community mod: expanded roster (Tekken fighters, Baek, Nina, CJ), moveset revisions, balance adjustments | **[Play Redux 0.4 Live ↗](https://trafgals.github.io/urban-reign-web/)** | 978 MB (Brotli Chunks) | 100% (73 BGM tracks) |
| **Urban Reign Retail** | Authentic 2005 original retail release (SLUS-21209) | **[Play Retail Live ↗](https://trafgals.github.io/urban-reign-retail/)** | 868 MB (Brotli Chunks) | 100% (73 BGM tracks) |

Both web ports feature **1-click cross-linking** in the on-screen *Game Edition* dropdown, and support loading custom local ISO images directly from your computer with zero network latency.

---

## ⚡ Web Port Highlights & Architecture

### 1. On-Demand Brotli Disc Streaming (< 1.0 GB GitHub Pages Compliance)
* Slices multi-gigabyte PS2 DVD images into 2 MB chunks compressed with Brotli (Quality 9).
* Empties non-essential MPEG-2 cutscenes to fit under GitHub Pages' strict 1,000 MB deployment limit without external hosting or subscription costs.
* Chunks are fetched on demand via HTTP Range requests and decompressed in real time using native `DecompressionStream('brotli')` (with high-performance WebAssembly fallbacks for legacy browsers).

### 2. 100% Stage Music Preservation
* Preserves 100% of all 73 original SPU2 high-fidelity BGM soundtrack streams (`DVD001.AFS` stream magic `0x800007fc`).
* Full stage music, announcer calls, fighter voice lines, and hit impacts play identically to the original hardware.

### 3. Smart Cutscene Auto-Skip
* Missing/stripped video sequences (`0x000001ba` MPEG streams between sectors `2,301,378,000` and `3,063,786,000`) are automatically detected in real time by the disc driver.
* The frontend injects an automated controller pulse (`Start` / `1 << 3`), immediately bypassing blank cutscene timers directly into menus and combat.
* Toggleable via the top control bar: `[x] Auto-skip cutscenes`.

### 4. Persistent 8 MB PS2 Memory Card (`Mcd001.ps2`)
* Standard PS2 8 MB memory card mounted directly in IndexedDB via Emscripten `IDBFS`.
* Storage persistence requested automatically via `navigator.storage?.persist?.()` to guard against browser cache eviction under disk pressure.
* **1-Click Export & Import**: Download your memory card at any time as an authentic `.ps2` file, or import an existing save file from PCSX2.

### 5. Harvested Indirect Function Pointers (Stability Fix)
* 811 indirect function pointer entry points harvested directly from `SLUS_212.09` assembly (`addiu $sp, $sp, -N`).
* Native C++ translated units expanded from 173 to **465 translation units** (7,161 functions, 631,087 instructions).
* Completely eliminates the runtime `missing code at 0x00346380` halt, verified past frame 2,765 at a steady 60.0 FPS.

---

## 🕹️ Controls

### Keyboard Layout
| Action | Player 1 Key | Gamepad (Standard Mapping) |
| :--- | :--- | :--- |
| **Move** | `Arrow Keys` or `I` `J` `K` `L` | Left Analog Stick / D-Pad |
| **Strike (Chain Opener)** | `Z` | `A` / Cross |
| **Grab / Mount** | `X` | `X` / Square |
| **Special Arts (SPA)** | `A` | `Y` / Triangle |
| **Dodge / Reversal** | `S` | `B` / Circle |
| **Cycle Target Lock** | `Q` / `W` | `LT` / `RT` / Bumpers |
| **Pause / Start** | `Enter` | `Start` |
| **Select** | `Backspace` | `Select` |

### Touch Controls
Phones and tablets automatically display an on-screen arcade overlay with dual touch thumbsticks, action clusters (`STRIKE`, `GRAB`, `SPA`, `DODGE`), and target switching.

---

## 🛠️ Developer Setup & Quality Verification

This repository adheres to the **Quality Verification Gates** (see [`AGENTS.md`](AGENTS.md)):

```bash
# Install dependencies
npm install

# Gate 1: Disc streaming, chunk decompression, and music preservation tests
npm test

# Gate 2: Automated Headless Chrome WebGPU Integration Test (verifies past frame 2,626)
npm run test:recomp

# Disc Slicing Tooling
npm run slice:redux   # Slices Redux 0.4 ISO into Brotli chunks in recomp-web/chunks/redux
npm run slice:retail  # Slices Retail ISO into Brotli chunks in ../urban-reign-retail/chunks/retail

# Local Development Server
npm run serve         # Serves recomp-web at http://localhost:8620 with COOP/COEP headers
```

---

## 💾 Offline PCSX2 Package (Manual Setup)

If you prefer playing offline in the PCSX2 emulator:

* **[Download Redux 0.4 + Textures — Complete Manual Package (1.75 GB Google Drive)](https://drive.google.com/file/d/127deHyx4wlYcyniWvTe1pl8oEXROJMxh/view)**
* [Release Notes & Checksums](https://github.com/Jasonafex/urban-reign-redux/releases/tag/v0.4.0) · [Project Website](https://jasonafex.github.io/urban-reign-redux/)
* Extract the archive and place `Urban Reign Redux 0.4.iso` in your PCSX2 games directory.
* Merge the supplied `ExtraMemory` settings and texture pack into PCSX2 (tested with PCSX2 2.7+).

---

## 📜 Licensing & Acknowledgements

* **Urban Reign Redux 0.4**: Community mod engineered by **Jasonafex**.
* **Urban Reign**: Original game copyright © 2005 Bandai Namco Entertainment Inc.
* This repository hosts WebAssembly web recompilations, disc chunk streaming tooling, and setup support. No affiliation or endorsement by the original publisher is implied.
