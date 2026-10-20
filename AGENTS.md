# AGENTS.md — Urban Reign Web Operating Protocol

This document governs autonomous and pair-programming agents (Antigravity, MiniMax `mcode`, local LLMs like Qwen on Strata) working on the **urban-reign-web** codebase. All agents must adhere to these directives.

---

## 1. Subagent Delegation & Review Contract

When a parent agent delegates tasks to a subagent (such as running `mcode exec`):

### 1.1 The Mandatory Subagent Audit Rule
The parent agent **MUST NEVER** blindly accept or skim a subagent's return message.
When a subagent reports back:
1. **Analyze the Report**: Scrutinize the subagent's summary for:
   - Any bugs, edge cases, or traps the subagent claimed to have uncovered or resolved.
   - Any unhandled design decisions, deferred tasks, or caveats noted in the output.
   - Any deviations from the target branch (e.g. subagent creating a feature branch or PR instead of committing directly to `main`).
2. **Inspect the Code Diff**: Audit the actual changes on disk (`git diff`, `git status`, or `view_file`):
   - Confirm whether claimed fixes actually exist in the code.
   - Ensure the fixes are architecturally sound, adhere to existing types, and do not introduce regressions.
3. **Remediate and Rework**: If any bugs, partial fixes, unaddressed edge cases, or regressions remain, the parent agent **MUST immediately rework and fix them** before proceeding with further phases or user handoff.
4. **Merge and Push to `main`**: If the subagent created a feature branch or PR, the parent agent must verify the tests, merge the branch into `main`, and push `main` to `origin/main`.

### 1.3 The Mandatory Functional Verification Rule (Every User Request)
For **every single user request**, the agent **MUST** write and execute an automated functional test verifying the exact feature or fix requested before concluding the turn or presenting results to the user.
- **Test Through to Active 3D Combat**: For all gameplay, emulator, or UI changes, automated tests must drive player inputs (Title -> Profile -> Memory Card -> Mode Select) all the way into active 3D combat (verifying past frame 4,000+ with real-time 3D geometry and HUD rendered), never halting at early boot logos or menus.
- **Zero Assumptions**: Never assume code or configuration works based solely on static edits, syntax checks, or build passes.
- **Automated Verification**: Implement and run a test script or harness (e.g., headless Chrome CDP boot/execution test, unit test, simulation tick test) that exercises the exact functionality end-to-end.
- **Failure Remediation**: If the test fails or uncovers regressions, diagnose the root cause immediately, fix the implementation, and re-run verification until 100% passing.

### 1.4 Multi-Agent Hierarchy
- **Primary Implementation Engine**: MiniMax `mcode` CLI (`mcode exec --permission full "<prompt>"`) where tokens are free.
- **Local Fallback Engine**: Local Qwen 3.8B running on Strata (`http://127.0.0.1:8090/v1`) if `mcode` runs out of tokens or is unavailable.
- **Parent Agent Role**: System architect, reviewer, quality gatekeeper, and release manager. Issues clear high-level goals, audits every commit, and ensures the repo stays clean.

---

## 2. Execution & Concurrency Rules

- **Zero Background Polling**: Agents **MUST NEVER** run busy-wait loops, sleep loops, or status-polling scripts in shells or subagents. Launch asynchronous tasks, stop tool calls, and rely on reactive system notifications when commands complete.
- **Always Ship on `main`**: All completed and verified work must land on `main` and be pushed to `origin/main`. Working trees must be left clean.
- **Preserve Documentation Integrity**: Maintain existing inline comments, design rationales, and test suite comments. Do not delete explanatory context.

---

## 3. Core Architectural Invariants

### 3.1 WebAssembly & Hardware WebGPU Presentation (`recomp-web/`)
- **Authentic PS2 Engine (`recomp-web/ps2web.wasm`, `ps2web.js`)**:
  - Recompiled C++ translation units (465 units, 7,161 functions, 631,087 instructions) capturing all 811 indirect function pointer entry points from `SLUS_212.09`.
  - Runs with real hardware WebGPU acceleration rasterizing GS registers at a rock-solid 60Hz.
  - Native SPU2 audio synthesizer and CDVD stream parser.
- **On-Demand Brotli Disc Streaming (`recomp-web/chunks/`)**:
  - Slices DVD ISO into 2 MB chunks compressed with Brotli (Quality 9), fitting under GitHub Pages' 1,000 MB deployment ceiling.
  - 100% of all 73 SPU2 BGM soundtrack streams preserved (`0x800007fc` stream magic).
  - Fast-path zero chunk omission ensures unmapped DVD space consumes 0 MB of bandwidth or disk.
- **Cutscene Auto-Skip**:
  - Detects stripped MPEG video ranges (`0x000001ba`, sectors `2,301,378,000` to `3,063,786,000`) and pulses controller `Start` (`1 << 3`) to immediately transition past blank screens.
- **Memory Card Persistence**:
  - 8 MB PS2 memory card mounted to IndexedDB via Emscripten `IDBFS` with `navigator.storage?.persist?.()` eviction guard and 1-click `.ps2` export/import.

---

## 4. Verification Gates

Before any change is considered complete and merged to `main`, the test gates must pass:

1. **Mandatory Functional Test (Per User Request)**:
   - An automated test (headless browser CDP test, integration test, or unit test) specifically verifying the requested functionality must be added/executed and pass 100%.
2. **`npm test`**:
   - `test/disc-chunk-driver.test.mjs` must pass 100% verifying chunk streaming, decompression, zero-fill fast path, LRU caching, and 100% music preservation.
3. **`npm run test:recomp`**:
   - Automated Headless Chrome WebGPU integration test verifying that the emulator boots, initializes chunk streaming, skips stripped video sequences, and executes past frame 2,626 without halting.
4. **Disc Slicing Integrity**:
   - `scripts/slice_redux.js` and `scripts/slice_retail.js` must produce valid manifests and chunks strictly below the 1,000 MB limit.
