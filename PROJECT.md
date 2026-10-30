# Project: Chessmate Chess.com Game Review Parity

## Architecture
- **Engine Core & Evaluation Layer**:
  - `src/engine/classificationTree.ts`: Win expectancy model $E(cp, rating)$, 11 move classifications, Static Exchange Evaluation (SEE), 4-part Brilliant Move criteria, CAPS2 harmonic power-mean blend ($p=0.25$), Universal Single-Game Performance Rating (Article 10773754).
  - `src/engine/stockfish.ts` & `review_pipeline.js`: Native Stockfish WebSocket bridge + WebAssembly fallback, move evaluation streaming, review pipeline aggregation.
- **UI & Design System Layer**:
  - `src/app/globals.css` & `tailwind.config.ts`: Clean styling tokens without destructive border-radius overrides, official classification colors.
  - `src/components/svg/rating.tsx`: Official Chess.com SVG badge glyphs with verified hex fills.
  - `src/components/menu/analysis/summary/*`: Review tab cards (Coach Verdict Card, Head-to-Head Accuracy Bar, Performance Rating Card, Classification Breakdown Table with rounded pills, ECO Opening Card).
  - `src/components/game/evaluation.tsx`: Contrast-fixed vertical evaluation bar with sigmoidal win expectancy height mapping.
  - `src/components/game/board.tsx`: On-board circular classification badge glyphs anchored to destination squares.
- **Interactive Learning & Analysis Layer**:
  - `src/components/menu/analysis/moves/comments.tsx`: Coach commentary speech bubble with avatar graphic, speech tail, correct alternative move SAN (`previousMove?.bestMoveSan`), and natural language explanations.
  - `src/components/menu/analysis/keyMoments/*`: Key Moments extractor (blunders, mistakes, misses, brilliant moves, turning points) and Stepper modal (`1 / N Key Moments`).
  - `src/components/menu/analysis/retry/*`: Interactive "Retry Mistakes" Trainer with board rollback to `game[k-1].fen`, drag-and-drop validation against `bestMoveSan`, and instant coach feedback.
  - `src/components/menu/analysis/gameChart.tsx`: Evaluation line chart with circular badge glyph markers (`??`, `?`, `X`, `!!`, `!`).
  - `src/utils/sound.ts`: Authentic audio triggers and Web Audio API synthesized Brilliant move fanfare.
- **Verification & QA Layer**:
  - `tests/test_complete_parity_suite.js`: Standalone automated parity test suite with reference Chess.com game review fixtures (Tiers 1-4).
  - `package.json` scripts: `npm run test:parity`, `npm run typecheck`, `npm run build`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Expected Points Model $E(cp, rating)$ | Win expectancy with rating scaling $s(rating) = \text{clamp}(0.60, 1.40, 1.35 - 0.35 \cdot (rating/1000))$ | M1 | R1 §1 |
| 2 | 11 Move Classifications | Calibrated thresholds for Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder, Forced | M1 | R1 §2 |
| 3 | Static Exchange Evaluation (SEE) | Minimax piece exchange evaluation algorithm for sacrifice detection | M1 | R1 §3 |
| 4 | 4-Part Brilliant Move Criteria | Sacrifice via SEE, objective soundness ($\Delta E \le 0.025$, $E_{after} \ge 0.40$), contested position ($E_{before} \le 0.88$, score $\le 350$), endgame uniqueness ($< 7$ pieces) | M1 | R1 §3 |
| 5 | Miss Classification | Accurate identification of blown wins, missed mates, and failure to punish blunders | M1 | R1 §2 |
| 6 | CAPS2 Harmonic Power-Mean Blend ($p=0.25$) | Unified game accuracy calculation across engine and UI reflecting human grading | M1 | R1 §4 |
| 7 | Universal Single-Game Performance Rating | Article 10773754 formula incorporating accuracy delta and error deductions (blunder, mistake, miss) | M1 | R1 §5 |
| 8 | Border-Radius & CSS Theme Normalization | Remove destructive global `border-radius: 0 !important` and restore Tailwind radii | M2 | R2 §1 |
| 9 | SVG Classification Badges & Colors | Official hex fills (`#26c2a3`, `#5c8bb0`, `#81b64c`, `#96bc4b`, `#a3b18a`, `#d5a47d`, `#f7c631`, `#ffa459`, `#ff7769`, `#fa412d`) | M2 | R2 §1 |
| 10 | Coach Verdict Card | Coach portrait avatar, speech bubble, dynamic game narrative summary | M2 | R2 §1 |
| 11 | Head-to-Head Accuracy Bar | Dual horizontal side-by-side comparative progress meter with player info and CAPS2 % | M2 | R2 §1 |
| 12 | Performance Rating Card | Elo shield badge cards with calculated single-game performance rating | M2 | R2 §1 |
| 13 | Classification Breakdown Table | Pill-shaped badge count capsules with official colors and labels | M2 | R2 §1 |
| 14 | ECO Opening Card | Opening title, ECO code badge, book icon, and exploration link | M2 | R2 §1 |
| 15 | On-Board Destination Badges | Circular SVG classification glyphs anchored to move destination squares | M2 | R2 §2 |
| 16 | Vertical Evaluation Bar | Fixed text contrast (visible when Black leads) and smooth sigmoidal height scaling | M2 | R2 §3 |
| 17 | Responsive Layout & Board Sizing | Mobile viewport width calculation accounting for evaluation bar | M2 | R2 §1 |
| 18 | Coach Commentary Speech Bubble | Speech bubble with coach avatar, speech pointer tail, correct alternative best move SAN, and explanations | M3 | R3 §1 |
| 19 | Key Moments Stepper | Automatic detection of critical moments and interactive stepper modal (`1 / N Key Moments`) | M3 | R3 §2 |
| 20 | Interactive "Retry Mistakes" Trainer | Board rollback to mistake FEN, drag-and-drop piece moves, instant coach feedback ("Best Move!", "Try Again") | M3 | R3 §3 |
| 21 | Evaluation Line Chart Markers | Colored circular badge glyph markers (`??`, `?`, `X`, `!!`, `!`) on timeline chart | M3 | R2 §3, R3 §4 |
| 22 | Authentic Audio System | Web Audio API synthesized Brilliant move fanfare and audio triggers for moves, captures, checks, game-over, retry | M3 | R3 §4 |
| 23 | Dual-Engine Architecture | Native Stockfish WebSocket bridge with graceful WebAssembly client fallback | M4 | R4 §1, §2 |
| 24 | Automated Parity Test Suite (Tiers 1-4) | `tests/test_complete_parity_suite.js` benchmarking classification agreement (>90%) and CAPS2 ($\pm 1.5\%$) on official fixtures | M4 | R4 §3 |
| 25 | Adversarial Coverage Hardening (Tier 5) | Challenger stress tests for edge cases, unusual sacrifices, and endgame positions | M4 | Final Milestone |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design test infra, runner, reference fixtures, and publish `TEST_READY.md` | none | DONE (9891711a) |
| M1 | Engine & Classification Mathematical Parity | Win expectancy calibration, 11 classifications, SEE, 4-part Brilliant criteria, CAPS2 $p=0.25$, Article 10773754 Performance Rating | none | DONE (6a0ce7a0) |
| M2 | Authentic Chess.com Review UI & Design System | Globals CSS reset fix, Review tab cards, SVG badge colors, on-board destination badges, eval bar | none | DONE (8e85d95e) |
| M3 | Coach Commentary, Key Moments & Mistake Retry Trainer | Coach speech bubble, Key Moments stepper, Retry Mistakes trainer, line chart markers, audio fanfare | M1, M2 | DONE (e4529da3) |
| M4 | Final Milestone (E2E Pass & Adversarial Hardening) | Phase 1: 100% E2E tests pass (Tiers 1-4). Phase 2: Tier 5 Adversarial Coverage Hardening. Clean typecheck & build. | M1, M2, M3, E2E | IN_PROGRESS |

## Interface Contracts
### Engine ↔ UI Summary & Move Analysis
- `src/engine/classificationTree.ts` exports:
  - `winExpectancy(centipawns: number, rating?: number): number`
  - `classifyMove(currentScore, previousScore, bestScore, previousBestScore, ...): MoveClassificationResult`
  - `staticExchangeEvaluation(fen: string, from: string, to: string): number`
  - `calculateCaps2GameAccuracy(accuracies: number[], p?: number, blend?: number): number`
  - `calculatePerformanceRating(elo: number, accuracy: number, tallies: Record<string, number>): number`
  - Types: `MoveClassification`, `ClassificationTally`, `PerformanceRatingResult`
- `AnalyzeContext` (`src/context/analyze.tsx`):
  - Provides `game`, `gameReview`, `playersAccuracy`, `performanceRating`, `keyMoments`, `retryMistakeState`

### UI ↔ Interactive Trainer & Key Moments
- `KeyMomentsStepper`:
  - Input: `moves: AnalyzedMove[]`
  - Emits: `onSelectMove(plyIndex: number)`, `onOpenRetry(plyIndex: number)`
- `RetryMistakesTrainer`:
  - Input: `fen: string`, `targetBestMove: string`, `playedMove: string`, `plyIndex: number`
  - Emits: `onAttempt(move: string): { isBest: boolean; feedback: string }`, `onComplete()`

## Code Layout
- `src/engine/classificationTree.ts` — Mathematical classification, Expected points, SEE, CAPS2, Performance Rating
- `src/engine/stockfish.ts` — Stockfish analysis loop, Multi-PV evaluation, evaluation normalization
- `src/engine/see.ts` (optional/integrated) — Minimax static exchange evaluation
- `src/app/globals.css` — Global CSS variables, remove destructive border-radius reset
- `tailwind.config.ts` — Restore border radius configuration
- `src/components/svg/rating.tsx` — Official SVG classification badges
- `src/components/menu/analysis/summary/summary.tsx` — Master review tab layout
- `src/components/menu/analysis/summary/coachVerdict.tsx` — Coach portrait & game narrative
- `src/components/menu/analysis/summary/playersAccuracy.tsx` — Head-to-head dual horizontal accuracy bar
- `src/components/menu/analysis/summary/ratingCount.tsx` — Classification count pill capsules
- `src/components/menu/analysis/summary/gameRating.tsx` — Performance rating cards
- `src/components/menu/analysis/summary/opening.tsx` — ECO opening card
- `src/components/game/evaluation.tsx` — Vertical evaluation bar with text contrast fix
- `src/components/game/board.tsx` — Chessboard with destination badges and audio triggers
- `src/components/menu/analysis/moves/comments.tsx` — Coach speech bubble with avatar & tail
- `src/components/menu/analysis/moves/moves.tsx` — Move list view with alternative best move passing
- `src/components/menu/analysis/keyMoments/*` — Key Moments stepper components
- `src/components/menu/analysis/retry/*` — Retry Mistakes interactive trainer
- `src/components/menu/analysis/gameChart.tsx` — Evaluation line chart with circular badge glyphs
- `src/utils/sound.ts` — Audio sound player & Web Audio API brilliant fanfare
- `tests/test_complete_parity_suite.js` — Automated parity test suite
- `TEST_INFRA.md` — E2E Testing methodology, test cases, and coverage thresholds
- `TEST_READY.md` — Test runner execution signals
