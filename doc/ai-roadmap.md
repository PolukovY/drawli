# AI-Enhanced Learning: Audit & Roadmap

Companion to [arch.md](arch.md) and [feature.md](feature.md) (both currently a bit stale — see
the note at the end). This document is the output of a full repo audit done before touching any
code, per the brief: understand what exists, find where AI genuinely helps, propose an
architecture, and lay out a phased plan. This is the "Phase 13" deliverable (Existing Game Audit
→ Missing Areas → New Game Proposals → Architecture → Prioritized Plan); Phase 14 (actual coding)
now has its first slice shipped — see **Status** below — with the rest starting only as each
following piece is reviewed.

## Status

- ✅ **Shipped**: game-play tracking (`gameStats` Dexie table: play count, cumulative stars,
  last-played, per game) and a parent-facing **Games Audit** screen (`Settings → Games audit`)
  ranking every game by how much it's played. This is the first slice of the P0 list below —
  pure deterministic instrumentation, no AI. Branch: `claude/games-audit-tracking`.
- ⬜ Everything else in Section E (P0's remaining items, P1–P4) is still just the plan.

## 0. Five findings that shape everything below

1. **SPEC.md explicitly forbids AI in the MVP** and lists "optional AI assistance" only under a
   post-MVP phase, gated on "validating the base drawing experience" first. This roadmap treats
   AI as strictly additive and optional — every game must work identically with the AI model
   never downloaded.
2. **There is no existing AI/ML groundwork of any kind.** Zero ML libraries in `package.json`,
   zero WebGPU references, zero Web Workers anywhere except the mandatory PWA service worker. A
   local-LLM feature is a first-of-its-kind addition, not an extension of something half-built.
3. **The "neural TTS" that already exists is a *cloud* integration, not local AI** — it POSTs to
   `VITE_TTS_ENDPOINT` (unconfigured in this repo) and always falls back to the browser's native
   `SpeechSynthesis`. There is also **zero speech recognition** anywhere. Any "Say It" / speech
   game is net-new work, not a wrapper around something that already listens.
4. **There is no mastery/spaced-repetition data model anywhere.** `ExerciseProgress` tracks only
   `status` + `timesCompleted` per drawing exercise; nothing tracks per-word or per-letter
   correctness. Phase 9's spaced repetition needs new persisted state before it needs any AI.
5. **Difficulty progression is the single biggest quality gap, and it has nothing to do with
   AI.** Of ~35 games, only 3 (`BiggerNumber`, `CountThings`, `SoundPosition`) ramp difficulty
   within a session or across rounds. The rest are exactly as easy on play #50 as play #1. This
   is P0/P1 work, deterministic, and would improve the app even if the AI phases never happened.

---

## A. Existing Game Audit

### Shared architecture (context for every entry below)

- **`useGameSession`** (`src/games/useGameSession.ts`): round counter, star awarding (2/round),
  fireworks + auto-advance (3s) on `solve()`, a no-penalty `miss()`. Used by ~25 of the ~35 games.
- **`useGameContent`** (`src/games/useGameContent.ts`): loads the shared picture/word/letter pool
  once per content language (`uk`/`en`/`es`). `pictures` excludes abstract motor/shapes
  categories (108 nameable items); `allPictures` includes them (148 total).
- **`shuffle.ts`**: seeded Fisher-Yates (LCG), so a replay reseeds deterministically. **Three
  older games (`Spell`, `Guess`, `Articles`) hand-roll their own copy of this instead of
  importing it** — first cleanup candidate.
- **Content volume**: 148 uk/en words, 128 es words (es has no words for the 20 abstract
  "motor" exercises), 335 drawable exercises, 33/26/27 letters per language. No per-word
  difficulty/frequency metadata exists — only a drawing-complexity `Difficulty` enum that lives
  on exercises, not words, and isn't read by any game logic today.
- **Every game is "no-fail" by design**: wrong answers fade a choice out, never remove stars,
  never show a red X. This is a real, consistent product decision — preserve it in everything
  new.

Per-game entries (grouped by what they teach; ★ = uses `useGameSession`, ⚙ = custom scoring):

| Game | Route | Objective | Current mechanics | Difficulty ramp? | Repetition risk | AI verdict |
|---|---|---|---|---|---|---|
| Spell ⚙ | `/spell` | Spell a pictured word from letter tiles | Sequential slots, 2–4 distractor letters | No | Moderate (pool-bound) | C |
| Missing Letters ★ | `/missing` | Fill blanks in a word | 2–3 gaps by word length | No (gap count only) | Moderate | C |
| Guess ⚙ | `/guess` | Word→picture recognition | 4-picture choice | No | Moderate | C |
| First Letter ★ | `/first-letter` | First-letter phonics | 4 letter choices | No | High (small alphabet) | C |
| Articles ⚙ | `/articles` | a/an, el/la | Binary choice, en/es only | No | **Highest** (binary choice) | C |
| Find Letter ★ | `/find-letter` | Letter matching | 4 letters, no pictures | No | High (most abstract) | D |
| Count ★ | `/count` | Count 1–9 | Repeated icon + number choice | No | Moderate | C |
| Bigger Number ★ | `/bigger` | Numeral comparison | Two numbers + dot count | **Yes** (9→20 by round) | Low-moderate | C |
| Odd One Out ★ | `/odd-one-out` | Categorization | 4 pictures, 1 doesn't fit | No | Moderate | C |
| Memory ⚙ | `/memory` | Visual short-term memory | 6-pair flip board | No (always 6 pairs) | Low (re-randomizes every visit, correctly) | B |
| Color by Numbers ⚙ | `/color-by-numbers` | Number↔color matching | Tap SVG region matching palette number | No | Moderate | D |
| Puzzle ⚙ | `/puzzle` | Spatial assembly | Always 4 pieces, tap-hold-place | No | **High** (piece count never grows) | D |
| Count Things ★ | `/count-things` | Selective counting w/ clutter | 3 emoji kinds mixed | **Yes** (5→9 by round) | Low-moderate | C |
| Symmetry ⚙ | `/symmetry` | Bilateral symmetry, fine motor | Draw missing mirror half | No, and **no correctness check at all** (any scribble completes it) | High (10-subject pool) | D |
| Memory Trace ⚙ | `/memory-trace` | Visual memory + drawing | Peek→draw→compare, no scoring | No | High (12-subject pool) | D |
| Listen ★ | `/listen` | Listening + spelling | TTS word, tap letters in order | No | Moderate | C |
| Tic-Tac-Toe ★ | `/tic-tac-toe` | Turn-taking strategy (no academic content) | vs. beatable-by-design robot | No | High | D |
| Snake ★ | `/snake` | Reflex/spatial planning | Swipe/arrows, apple targets | No (round length only) | High | D |
| Sea Battle ★ | `/sea-battle` | Deduction/search | 6×6 grid, fixed 4-ship fleet | No | Moderate-high | D |
| Patterns ★ | `/patterns` | Sequence prediction | ABAB→ABC→AAB | **Yes** (by round) | Moderate | B |
| Connect the Dots ★ | `/connect-dots` | Ordinal counting | Tap dots 1→N, draws shape | No | **High** (only 6 shapes) | D |
| Find the Shadow ★ | `/shadow` | Visual matching | Picture vs. 3 silhouettes | No | Low (large picture pool) | D |
| What's Gone? ★ | `/whats-gone` | Visual memory/attention | 4–6 cards, one removed | **Yes** (4→6 cards) | Moderate (small emoji pool) | D |
| Size Order ★ | `/size-order` | Seriation | 4 sizes, tap smallest→largest | No | Moderate-high | D |
| Sorting ★ | `/sorting` | Categorization | Hold-then-drop into 2 baskets | No | Low (large picture pool) | D |
| Maze ★ | `/maze` | Spatial navigation | 7×7 DFS-generated maze | No | Moderate | D |
| Plus/Minus ★ | `/plus-minus` | Addition/subtraction to 9 | Emoji groups + operator | **Yes** (addition-only, then mixed) | Moderate | C |
| Picture Sudoku ★ | `/picture-sudoku` | Logic/constraint satisfaction | 4×4 grid, 3 fixed emoji sets | **Yes** (6→8 blanks) | **High** (3 sets total) | D |
| Differences ★ | `/differences` | Visual attention | 2 grids, find 3 swaps | No | Moderate-high | D |
| Clap the Word ★ | `/syllables` | Syllable **counting** | TTS + manual clap counter + pick count | No | Moderate | C |
| Read it Syllable by Syllable ★ | `/read-syllables` | Reading practice (decode+blend) | Tap-to-hear each syllable chunk | No (2–4 syllable words only) | Moderate | B |
| Where is the Sound? ★ | `/sound-position` | Phonemic awareness | Start/middle/end, wrong→syllable scaffold | **Yes** (start→end→middle grouping) | Moderate | B |
| Odd Word Out (audio) ★ | `/odd-word` | Auditory categorization | 4 spoken words, find the odd one | No | Moderate | C |
| Rock-Paper-Scissors ★ | `/rock-paper-scissors` | None (pure chance) | Fully random computer move | No | High | D |
| Photo Studio | `/photo-studio` | Creative expression | Effects/scenes/animal cutouts | N/A | N/A | **D by explicit product decision** (code comment: *"No AI, no internet"*) — keep it that way |

**AI verdict key**: A = AI significantly improves it · B = AI provides useful variation on top of
deterministic correctness · C = deterministic logic is already the right tool, AI adds nothing
worth the cost · D = AI should not touch this game at all.

Notably: **no existing game scored an "A."** Nothing here is currently broken in a way only an
LLM could fix — every real weakness (flat difficulty, small content pools, three duplicated
game shells) has a concrete deterministic fix. This matches the brief's own principle: *"AI is
not the source of truth."* Where AI does help (marked B), it's exactly the brief's own good
example — variation and phrasing on top of a deterministic answer, never picking the answer.

### Concrete improvement plan, by category (the "exact HOW", not "make it better")

**Cross-cutting (fix once, benefits many games):**
1. *Migrate `Spell`, `Guess`, `Articles` onto `useGameSession` + the shared `shuffle.ts`.*
   Removes ~60–80 duplicated lines per game and the risk of their private shuffle drifting from
   the canonical one. Zero behavior change to the child.
2. *Add a shared `useDifficultyTier(round, tiers)` helper*, generalizing the two-tier pattern
   already proven in `BiggerNumber`/`CountThings`, and apply it to every "No" row in the ramp
   column above where it's cheap to do so (e.g., `Count`: cap at 5 for rounds 0–1, 9 after;
   `FirstLetter`/`FindLetter`: start with visually-distinct distractor letters, introduce
   visually-similar ones — b/d, p/q — only in later rounds; `PictureSudoku`/`Puzzle`: grow piece
   count 4→6→9 across repeat plays, tracked via the new `learningStats` table in P0 below).
3. ~~Fix the Articles English data bug~~ — **checked, not actually a bug**: an earlier pass of
   this audit claimed `articles.json`'s English half was always `"a"`, based on sampling only the
   first few (consonant-starting, abstract-category) entries. The full file was verified directly:
   135 "a" / 13 "an", zero mismatches against which words actually start with a vowel letter. No
   fix needed here — corrected so this doesn't get "fixed" again later.
4. *Grow the smallest fixed content pools*, which are the games' own biggest repetition-risk
   contributors and need no AI: `Puzzle`'s piece count, `Connect the Dots`'s 6 shapes,
   `PictureSudoku`'s 3 emoji sets, `Symmetry`/`MemoryTrace`'s 10–12 subject pools, `WhatsGone`'s
   16-emoji bank.
5. *Persist a lightweight per-item stat* (new Dexie table, detailed in Section D/E) — `{gameId,
   itemId, seenCount, missCount, lastSeenAt}` — and bias the existing `shuffle()` call sites in
   the vocabulary/phonics games (marked B/C above) toward under-practiced or recently-missed
   items. This is Phase 9's spaced repetition, fully deterministic, and is P0/P1 work — it does
   not need the LLM to exist at all.

---

## B. Missing Learning Areas

- **Progressive guide-weakening for letters/numbers.** `DrawingPage`'s guide is currently
  binary (fully shown or fully hidden, remembered only per-session) — there's no "strong dotted
  guide → weak guide → start-point hint → free writing" progression, and no per-letter mastery
  tracking at all (only exercise-level `status`/`timesCompleted`).
- **A word-level writing flow that chains individual letters into a picture reward** (the
  brief's "Write With Me"). `Spell` is close but is tile-assembly, not trace-each-letter.
- **A concrete→abstract math bridge.** `PlusMinus` starts directly at emoji groups + a numeric
  answer; nothing walks a child through "give the monster one more" as a physical action before
  showing `2 + 1 = 3`.
- **Any speech-input capability whatsoever.** Zero `SpeechRecognition` usage anywhere. A
  dedicated Speech/Logopedic area (Phase 7) is 100% new infrastructure.
- **A parent-facing progress view.** `ProgressPage` today shows the child aggregate stars/exercise
  completion; there's no "today: 12 words practiced, letter R practiced 4 times" summary, and no
  parent configuration screen for target vocabulary/sounds/difficulty at all.
- **Any personalization/spaced-repetition layer** (see Finding #4 above).
- Two items **explicitly called out as missing in `feature.md` itself** (lowercase letters,
  cross-device sync) are out of scope for this AI-focused roadmap but are worth remembering if
  "Write With Me" is scoped to include lowercase — it would hit that gap immediately.

---

## C. New Game Proposals

Following the brief's own principle — *"favor improving existing functionality before
duplicating it"* — several of the brief's example games **already exist** under a different
name. I'm proposing enhancements for those, not near-duplicate new pages, and reserving "new
game" status for genuine gaps.

### Already covered — enhance, don't duplicate
| Brief's idea | Existing game | Recommended enhancement |
|---|---|---|
| Build a Word | `Spell` | Add picture-hidden mode at higher tiers, grow word-length tiers (3→4→5 letters), scale distractor-letter count with tier |
| Listen & Choose | `Guess` + `Listen` | Wire in the new per-word `learningStats` bias so previously-missed words resurface |
| Count It | `Count` + `CountThings` | Extend range from 1–9 to 1–20 as a later-round tier |
| Write the Number | `DrawingPage` (numbers category) | Apply the same guide-weakening work planned for letters |
| Memory | `Memory` | Add picture↔word and audio↔picture modes (data already exists via `useGameContent`) |
| What Comes Next | `Patterns` | Already does exactly this; just needs the content-pool growth from Section A |
| Trace the Letter | `DrawingPage` (letters category) | This is an *enhancement*, detailed below, not a new page |

### Genuinely new

**1. Trace the Letter (enhancement to `DrawingPage`, not a new route)**
- *Purpose/objective*: real progressive letter-writing mastery, which doesn't exist today.
- *Age fit*: 5+, directly matches the existing letters_uk/en/es content.
- *Mechanics*: add 3 more guide strengths on top of today's binary toggle — strong dotted (today's
  default), weak/thinned stroke, start-point-dot-only, free writing — advancing per-letter based
  on the new mastery record (below), not a global session toggle.
- *Progression*: a per-letter mastery counter (new Dexie fields) advances the guide strength;
  regresses one level if a letter is later re-practiced and the child asks to see the guide again.
- *Reward*: reuses the existing star system; a "letters practiced" collection view (new, simple)
  in Progress.
- *AI role*: **none required.** Purely deterministic guide-strength state machine.
- *Deterministic role*: 100% — guide strength, advancement rule, star award.
- *Technical complexity*: **Medium.** Reuses `GuideLayer`/`TutorLayer`/`DrawingEngine` as-is;
  needs a new Dexie table and a small state machine in `DrawingPage`.

**2. Write With Me (new page, reuses `DrawingCanvas`/`GuideLayer`)**
- *Purpose*: bridge from single-letter tracing to whole-word writing with a payoff.
- *Mechanics*: pick a short word from validated vocabulary (never the LLM); show letters one at a
  time using the same guide machinery as Trace the Letter; after the last letter, reveal
  `CAT 🐱` with TTS pronunciation of the whole word.
- *Progression*: 3-letter words first, then 4+; uppercase only (matches the current app-wide gap).
- *Reward*: a completed-word sticker in a collection screen.
- *AI role*: **B** — the LLM may help pick which words are practiced in what order (a curated
  variety generator, not the source of correctness), and may generate a short encouraging line
  once the word is spelled — spelling itself always comes from `words.json`, never the model.
- *Deterministic role*: word spelling, letter order, star award, TTS pronunciation.
- *Technical complexity*: **Medium** — new page, but almost entirely composed of existing
  drawing-canvas building blocks.

**3. Feed the Monster (new page)**
- *Purpose*: concrete-to-abstract addition, filling the gap `PlusMinus` skips.
- *Mechanics*: monster shown with N visible fruit; "give him 1 more" — child taps to add a piece
  one at a time; only after the physical action does `2 + 1 = 3` appear.
- *Progression*: sums to 5 first, then to 9 (reusing the `useDifficultyTier` helper from Section A).
- *Reward*: monster's expression/animation gets happier; stars as usual.
- *AI role*: **D for the math** (must stay deterministic) / **B for flavor** — LLM could vary
  which fruit/monster theme appears, never the sum.
- *Technical complexity*: **Low-medium.**

**4. Find It (new page)**
- *Purpose*: language comprehension + sustained attention, no existing equivalent.
- *Mechanics*: "Find the apple" → several large picture choices; escalates to "find the *red*
  apple," then "find the *small red* apple" as the child progresses.
- *Progression*: attribute count (0→1→2 descriptors) scales with the difficulty tier.
- *AI role*: **B** — LLM can generate the instruction phrasing/attribute combination for variety;
  the vocabulary engine (not the LLM) validates which picture is actually correct, exactly like
  the brief's own "GOOD" example.
- *Deterministic role*: which picture is correct, given the chosen attributes.
- *Technical complexity*: **Medium** — needs pictures tagged with color/size attributes, which
  don't exist in the content pipeline today (a real, scoped content-data addition, not a rewrite).

**5. Draw It (new mode on `FreeDrawPage`)**
- *Purpose*: creative drawing with a fresh prompt each time, using the canvas that already exists.
- *Mechanics*: show a short instruction ("Draw a fish," "Draw a red flower"); child draws freely
  on the existing `DrawingCanvas`; no correctness check, no recognition required to play.
- *AI role*: **A** — this is the one place in the whole app where generative variety is the
  entire point; a tiny local LLM turns a static prompt list into an effectively endless one.
  *Vision-based recognition is explicitly out of scope for v1*: the brief itself says not to
  require it, and a 270M-class text model can't do vision anyway — that would need a wholly
  separate (and today unjustified) vision model. If ever explored, it belongs in Phase 4/optional,
  clearly labeled experimental, and must never gate whether the game "works."
- *Deterministic role*: the drawing canvas itself, save/gallery flow — all of it reuses
  `FreeDrawPage` unchanged.
- *Technical complexity*: **Low** once `LocalAIService` exists — this is the simplest possible
  consumer of it (one text-generation call, no structured JSON even needed beyond a plain
  string).

**6. Say It / Speech Games area (Phase 7 — flagged, not committed)**
- *Purpose*: therapist-configured articulation practice (target sound, word list, repetitions),
  turned into playful repeat-and-progress interactions (rocket moves, frog jumps).
- *Age fit*: 5+, parent/therapist-configured.
- *AI role*: **B, narrowly** — the LLM may generate game-flavor variations around
  therapist-approved vocabulary lists (never invents the vocabulary itself); it must **never**
  claim to judge pronunciation correctness. If Web Speech API recognition is used at all, it can
  only ever confirm *which word text was recognized* (speech-to-text), which is a fundamentally
  different and weaker signal than phoneme-level articulation correctness — the UI must make that
  distinction explicit rather than implying "the app checked your R sound."
- *Technical complexity*: **High** — genuinely new infrastructure (parent config screens, a
  vocabulary-list data model, and an honest framing of what recognition can and can't confirm).
  Recommend this stays a **P4/research spike**, not a committed P2/P3 deliverable, until a
  browser speech-recognition feasibility check is done specifically for this.

---

## D. Local Browser AI Architecture

### Library: Transformers.js (Hugging Face v3+), not WebLLM/MLC

Both libraries fall back to WASM when WebGPU is absent — this isn't a differentiator by itself.
The deciding factors:

- **WebGPU is not universal on this app's actual target devices yet.** Safari only shipped
  WebGPU with iOS/iPadOS 26 (this year's release) — a real share of iPads in active use will be
  on older iOS without it for a while. Chrome/Android has had it longer, but "assume WebGPU" is
  not a safe default for a tablet-first app whose whole audience is exactly the devices most
  likely to be a version or two behind. **WASM must be treated as the common path, not the edge
  case** — Transformers.js is built WASM-first with WebGPU as an opt-in accelerator
  (`device: 'webgpu'`), which matches that reality better than a WebGPU-primary runtime.
- **Transformers.js already sits on ONNX Runtime Web**, so choosing it gets WebGPU/WASM/WebNN
  execution paths "for free" through a friendlier, model-hub-integrated API — no reason to
  hand-roll ONNX Runtime Web directly unless a specific model isn't wrapped yet.
- **Broader task support** (text generation, embeddings, and more) keeps the door open for future
  needs without a second runtime — useful given `LocalAIService` must stay provider-agnostic
  anyway.

### Model: Gemma 3 270M first, Qwen2.5-0.5B-Instruct as the fallback candidate

- **`onnx-community/gemma-3-270m-it-ONNX`** as the primary target: ~270M params (roughly
  125–300MB depending on quantization), documented for structured/JSON-style output (a
  fine-tuned function-calling variant of the same base model exists, which is a strong signal
  for our own structured-output needs), 32K context (far more than one generation prompt needs),
  and independently documented as extremely battery-efficient — the right instinct for a device
  this app must not drain.
- **Do not default to anything ≥1.5B.** Research consistently places "the practical usable range"
  at roughly 1.5B at 4-bit on strong consumer hardware — a shared browser tab on a mid-range
  Android tablet has meaningfully less headroom than that benchmark assumes. Start small; only
  escalate (e.g., to Qwen2.5-0.5B-Instruct, also available in a 4-bit ONNX/WebLLM port) if real
  on-device testing shows 270M's structured-output reliability is too poor for a specific use
  case — this must be settled empirically in P0, not guessed here.
- **Never ship a 3B–7B model** as a default under any circumstance for this app.

### Performance reality to design around

- WASM inference for this size class runs at roughly single-digit-seconds latency for a short
  generation on a mid-range device, not sub-second. **No game mechanic should require an
  instant AI response to feel right** — every AI-assisted feature (hints, variation, prompts)
  must show a lightweight "thinking" state and remain fully playable via the deterministic
  fallback if the child taps through before generation finishes.
- WebGPU, where available, is a speed bonus, not something to design the UX timing around.

### Caching

- **Do not add the model to Workbox's `generateSW` precache globs.** The existing config has no
  `maximumFileSizeToCacheInBytes` override (default 2MiB) and the app deliberately excludes the
  335-exercise content library from precache for the same reason — "the first install shouldn't
  have to download megabytes it doesn't need yet" is already this app's stated philosophy
  (`arch.md` §7) and applies even more to a multi-hundred-MB model.
- **Reuse the exact idiom `NeuralSpeech.ts` already uses**: `caches.open('drawli-neural-tts-v1')`
  for its own audio blobs. A new `drawli-ai-model-v1` Cache Storage bucket, downloaded only the
  first time a game actually calls into `LocalAIService`, is the same pattern applied to model
  shards — no new caching concept needs inventing.

### Worker architecture

Zero existing Web Worker usage in this codebase outside the mandatory service worker — this is
genuinely new plumbing, not a refactor. Run the Transformers.js `pipeline()` inside one dedicated
Web Worker (Transformers.js's own recommended pattern), talk to it over a small typed
`postMessage` protocol (`load | generate | abort | progress | result | error`), and wire the
worker's `AbortController` to a page-navigation/game-unmount cleanup so leaving a game cancels
in-flight generation — this directly satisfies "abort inference when leaving a game" and "the UI
must remain responsive during inference."

### Structured output & validation

1. One small schema per generation intent (`DistractorSet`, `HintText`, `VariationPrompt`,
   `DrawingPrompt`, `StoryText`) — plain hand-checked validators are enough at this scale; a
   dependency like Zod is optional, not required.
2. Prompt with a strict instruction + a concrete example of the exact JSON shape wanted.
3. Parse → validate (right types, right array length, no duplicate/blank distractors, a simple
   length/denylist check since a child will see this text) → on failure, retry once with a
   stricter re-prompt → on a second failure, use the same deterministic canned content the game
   would have used with no AI at all. **The child never sees raw or malformed model output.**

### `LocalAIService` shape

```ts
interface LocalAIService {
  readonly status: 'unavailable' | 'idle' | 'loading' | 'ready' | 'error'
  isSupported(): boolean // WebGPU or WASM+SIMD present at all
  load(onProgress?: (pct: number) => void): Promise<boolean>
  unload(): void
  abort(): void
  generateDistractors(req: DistractorRequest): Promise<string[]>
  generateHint(req: HintRequest): Promise<string>
  generateVariation(req: VariationRequest): Promise<GeneratedText>
  generateDrawingPrompt(req: DrawingPromptRequest): Promise<DrawingPrompt>
  generateStory(req: StoryRequest): Promise<string>
}
```

Games import only this interface (via a `useLocalAI()` hook) and a deterministic fallback
generator they already need anyway — never the concrete `TransformersJsProvider` or any
model/library types. Swapping the runtime or model later touches one file.

**One deliberate deviation from the brief's Phase 5 list**: `selectLearningContent` is listed
there as something "AI may help with." I'm recommending it stay **fully deterministic** (a
weighted-random pick over the new `learningStats` table, biased toward low-seen/high-miss items)
rather than delegating selection to the LLM — this is a statistics problem, not a generation
problem, and the brief's own core principle ("AI is not the source of truth") argues for keeping
*which item appears* deterministic while letting AI only vary *how it's phrased or drawn*.

---

## E. Prioritized Implementation Plan

**P0 — Foundation (no AI, ships value immediately, de-risks everything after it)**
- ✅ **Shipped**: `gameStats` Dexie table (version 3) — play count, cumulative stars, last-played
  per game — plus the Games Audit screen reading it. This is the coarse, per-*game* half of this
  bullet; see Status above.
- Still open: a finer-grained `learningStats` table (`{gameId, itemId, seenCount, missCount,
  lastSeenAt}`, per *word/letter*, would land as version 4 on top of the schema above) and a
  deterministic weighted-selection helper on top of it; wire into 2–3 games as a proof of concept.
  This is what actually powers spaced repetition (Phase 9) — `gameStats` alone only tells you
  *which games* get played, not *which words within them* still need practice.
- Shared `useDifficultyTier` helper; apply to the highest-repetition-risk flat games from Section A.
- Migrate `Spell`/`Guess`/`Articles` onto `useGameSession` + shared `shuffle.ts`.
- ~~Fix the Articles en a/an data bug~~ — not real, see the note above.
- Scaffold `LocalAIService` as an interface + a `NoopProvider` (always returns the deterministic
  fallback) — ships as inert, zero-risk plumbing before any model integration exists.

**P1 — Existing-game improvements (Section A's per-game list)**
- Content-pool growth for `Puzzle`, `Connect the Dots`, `PictureSudoku`, `Symmetry`, `MemoryTrace`,
  `WhatsGone`.
- Wire `learningStats`-biased selection into the rest of the vocabulary/phonics games (`Guess`,
  `Listen`, `Missing`, `FirstLetter`, `Syllables`, `SoundPosition`, `OddWord`).
- Extend `Count`/`CountThings` range toward 1–20.

**P2 — Highest-value new games (fully deterministic, ship with zero AI dependency)**
- Trace the Letter (guide-weakening + per-letter mastery, enhancement to `DrawingPage`).
- Write With Me.
- Feed the Monster.
- Find It (needs the content-pipeline addition of color/size attributes, scoped separately).

**P3 — AI-enhanced/adaptive (behind `LocalAIService`, opt-in, graceful no-op everywhere else)**
- Integrate Transformers.js + Gemma 3 270M in a Worker; empirically validate structured-output
  reliability before committing to it over Qwen2.5-0.5B-Instruct.
- Draw It (the cleanest first consumer — plain text, no structured JSON needed).
- `generateDistractors`/`generateVariation` layered onto 2–3 already-shipped P1 games as an
  optional enhancement.
- Parent-mode: AI model download/remove toggle, offline-AI status indicator.

**P4 — Optional/advanced (research spikes, not commitments)**
- Say It / Speech Games area — pending a dedicated speech-recognition feasibility check.
- Richer parent dashboard (today/weekly summary).
- Simple AI-generated short stories.
- Drawing-recognition-as-feedback — explicitly experimental only, never required for a game to
  function, and only revisited if a genuinely lightweight local vision model becomes viable for
  this device class (not assumed here).

---

## A note on `arch.md`/`feature.md`

Both are already a little stale against the current codebase (e.g. `arch.md` states
`registerType: 'autoUpdate'` where the code now uses `'prompt'`; `feature.md`'s game count and
list predate `Read it Syllable by Syllable`, `Where is the Sound?`, `Rock-Paper-Scissors`, and
Photo Studio). Worth a refresh pass independent of this roadmap — not done here to keep this
document focused on the AI audit it was asked to produce.

## Open questions before P0 starts

1. Confirm the P0–P4 grouping and priorities above match your intent before I start P0 work.
2. `Find It`'s attribute-tagging (color/size per picture) is new content-pipeline scope — worth
   sizing separately before P2 commits to it.
3. Say It / speech-recognition feasibility — want a short research spike now, or defer entirely
   until P3 is done?
