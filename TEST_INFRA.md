# Chessmate E2E Parity Testing Infrastructure & Architecture

**Document Version:** 1.0.0  
**Target Milestone:** E2E Testing Track / M1-M4 Verification  
**Author:** E2E Test Suite Architect & Writer  
**Integrity Mode:** Development / Production Verification  
**Project Root:** `C:\Users\aatif\.gemini\antigravity\scratch\chessmate`  

---

## 1. Executive Summary & Testing Philosophy

The Chessmate test infrastructure provides a deterministic, automated, and mathematically rigorous verification harness ensuring 100% parity with Chess.com's official Game Review system, Classification V2, CAPS2 accuracy scoring, and Article 10773754 Single-Game Estimated Performance Rating.

### Core Testing Tenets
1. **Authoritative Specification Sources**: Every test case derives expected outputs strictly from authoritative mathematical definitions in official Chess.com support articles (Articles 8572705, 8584089, 8708970, 8379354, 10773754) and official Chess.com Game Review fixtures.
2. **Zero Facade Testing**: No mock assertions that trivially pass. All assertions validate genuine algorithmic properties, boundary behavior, and numerical convergence.
3. **Standalone & Fast Execution**: Runs via standard Node.js (`node tests/test_complete_parity_suite.js`) in under 2 seconds without external network dependencies, web socket dependencies, or missing binary bottlenecks.
4. **Four-Tier Hierarchy**: Tests progress from unit-level feature contracts (Tier 1) through boundary conditions (Tier 2) and multi-component interactions (Tier 3) to real-world benchmark game validation (Tier 4).
5. **Clear Defect Escalation**: When engine bugs or missing exports are discovered, tests fail with exact diagnostic diffs, logging implementation defects directly for the implementing agent.

---

## 2. Four-Tier Testing Hierarchy

```
+-------------------------------------------------------------------------+
|                  TIER 4: Real-World Application Scenarios               |
|      6 Reference Games | 510 Plies | >90% Agreement | CAPS2 +/-1.5%     |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 3: Cross-Feature Combinations                     |
|  SEE x Endgame Uniqueness | CAPS2 1 vs 5 Blunders | Rating Sensitivity  |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 2: Boundary & Corner Cases                        |
|  Elo: 100-3200 | Mates & Inf: +/-99000 | Bare Pieces | Lost Mitigation  |
+-------------------------------------------------------------------------+
                                    ▲
+-------------------------------------------------------------------------+
|                  TIER 1: Feature Coverage (>=5 tests per feature)       |
|  Win Expectancy | 11 Classifications | SEE | Brilliant | CAPS2 | Rating |
+-------------------------------------------------------------------------+
```

### Tier 1: Feature Coverage (>= 5 Tests Per Feature)
Validates the fundamental contract of each core engine feature:
1. **Expected Points Model $E(cp, rating)$**:
   - $E(0, rating) = 0.50$ (objective equality).
   - Dynamic sensitivity scaling $s(rating) = \text{clamp}(0.60, 1.40, 1.35 - 0.35 \cdot (rating/1000))$.
   - Monotonicity across rating brackets: Novice ($R < 1000$), Intermediate ($1000 \le R \le 1800$), Master ($R > 1800$).
   - Point reflection symmetry: $E(-cp, R) = 1.0 - E(cp, R)$.
   - Expected points loss: $\Delta E = \max(0, E_{before} - E_{after})$.
2. **11 Move Classifications**:
   - Brilliant (!!), Great (!), Best (*), Excellent, Good, Book (📖), Inaccuracy (?!), Mistake (?), Miss (X), Blunder (??), Forced.
   - Classification boundaries based on $\Delta E$:
     - Best: $\Delta E \le 0.002$ or engine top recommendation.
     - Excellent: $0.00 < \Delta E \le 0.02$.
     - Good: $0.02 < \Delta E \le 0.05$.
     - Inaccuracy: $0.05 \le \Delta E < 0.10$.
     - Mistake: $0.10 \le \Delta E < 0.20$.
     - Blunder: $\Delta E \ge 0.20$.
3. **Static Exchange Evaluation (SEE)**:
   - Recursive minimax piece exchange evaluation.
   - Standard piece values: Pawn = 100, Knight = 300, Bishop = 300, Rook = 500, Queen = 900, King = 20,000.
   - Positive exchange (winning capture), neutral exchange (equal trade), negative exchange (material sacrifice).
   - Least Valuable Attacker (LVA) capture ordering and stand-pat cutoff.
4. **4-Part Brilliant Move (!!) Criteria**:
   - Part 1: Volunteer piece or exchange sacrifice verified via SEE ($SEE < 0$).
   - Part 2: Objective soundness ($\Delta E \le 0.025$, $E_{after} \ge 0.40$ or $scoreAfter \ge -30$).
   - Part 3: Contested precondition ($scoreBefore \le +350$ cp and $E_{before} \le 0.88$).
   - Part 4: Endgame uniqueness (if remaining non-king pieces $< 7$, sacrifice must be the sole winning move with second-best drop).
5. **CAPS2 Harmonic Power-Mean Blend ($p = 0.25$)**:
   - Individual move accuracy $A(\Delta_{loss}, R)$ mapping $\Delta E$ and centipawn loss to human academic score $[0, 100]$.
   - Harmonic power-mean game aggregation:
     $$A_{power} = \left(\frac{1}{N}\sum_{i=1}^N \max(A_i, 0.1)^{0.25}\right)^{1/0.25}$$
     $$A_{blended} = 0.75 \cdot A_{power} + 0.25 \cdot A_{arith}$$
6. **Universal Single-Game Estimated Performance Rating (Article 10773754)**:
   - Expected accuracy baseline: $ExpectedAcc(Elo) = \text{clamp}(55, 95, 68 + (Elo - 1000) \cdot 0.015)$.
   - Accuracy performance delta: $\Delta Acc = (Accuracy - ExpectedAcc) \cdot 26$.
   - Move classification error deductions: $\Delta Err = -(Blunders \cdot 110) - (Mistakes \cdot 45) - (Misses \cdot 25)$.
   - Final Elo estimate: $Performance = \text{roundTo50}(\text{clamp}(100, 3200, Elo + \Delta Acc + \Delta Err))$.

---

### Tier 2: Boundary & Corner Cases (>= 5 Tests Per Feature)
Stresses the engine against edge inputs, singularities, and domain extremes:
1. **Extreme Rating Boundaries**:
   - Elo = 100 (Article 10773754 absolute lower bound).
   - Elo = 400 (novice boundary).
   - Elo = 2800 (super-grandmaster).
   - Elo = 3200 (system ceiling).
   - Out-of-bounds inputs (<100, >3200) clamped safely without numeric overflow or NaN.
2. **Extreme Evaluations & Checkmates**:
   - Mate-in-1: $+99000$ to $+100000 \implies E = 1.0$.
   - Mate-in-N: $+90000$ to $+98990 \implies E = 1.0$.
   - Allowed checkmate: $-99000 \implies E = 0.0$, accuracy = $0.0\%$, blunder badge.
   - Extreme material score: $\pm 3000$ cp ($\pm 30.00$) asymptotic convergence.
   - Zero evaluation: $cp = 0 \implies E = 0.5000$.
3. **Bare Piece Positions & Endgame Transitions**:
   - 2 kings left ($piecesCount = 0$): dead draw, endgame condition active.
   - Pawn endings ($piecesCount = 1, 2$): $<7$ non-king pieces enforce strict uniqueness.
   - Transition boundary: $piecesCount = 6$ (uniqueness enforced) vs $piecesCount = 7$ (uniqueness relaxed).
   - King and Rook vs King ($piecesCount = 1$).
4. **Sacrifices, Promotions & Pawn Traps**:
   - Queen sacrifices ($SEE = -600$ to $-900$).
   - Minor piece sacrifices on defended squares ($SEE = -300$).
   - Pawn promotions on capture squares (handling $Q - P$ material value boost).
   - Quiet volunteer sacrifices (leaving a minor en prise when it could have safely retreated).
5. **Completely Winning vs Completely Lost Positions (Mitigation)**:
   - Dead lost mitigation ($scoreBefore \le -320$ cp): dropping from $-600$ to $-900$ cp does NOT trigger blunder because winning equity was already 0%; maps to Inaccuracy.
   - Dead lost exception: allowing immediate checkmate ($scoreAfter \le -90000$) ALWAYS triggers blunder.
   - Completely winning position ($scoreBefore \ge +900$ cp): dropping from $+900$ to $+600$ cp preserves $\Delta E \approx 0.00$ and does NOT trigger blunder.
   - Missed win from equality vs missed win from already winning.

---

### Tier 3: Cross-Feature Combinations
Tests the complex feedback loops between multiple interdependent algorithms:
1. **SEE Sacrifice Detection $\times$ Endgame Piece Count**:
   - In middlegame ($piecesCount = 20$), a sound sacrifice is Brilliant even if alternative winning moves exist.
   - In endgame ($piecesCount = 4 < 7$), the exact same sacrifice is DEMOTED to Best or Great if a non-sacrificial winning alternative exists ($secondBestScore \approx afterScore$).
   - In endgame ($piecesCount = 4 < 7$), if no sound alternative exists, Brilliant is preserved.
2. **CAPS2 Power-Mean Game Aggregation: 1 Blunder vs 5 Blunders**:
   - Game 1: 39 moves at 98% accuracy + 1 blunder (0%). Power-mean ($p=0.25$) sharply discounts the score from arithmetic 95.5% to blended ~85%.
   - Game 2: 35 moves at 98% accuracy + 5 blunders (0%). Arithmetic mean gives 85.8%, but power-mean ($p=0.25$) severely penalizes repeated blunders down to ~55-60%.
3. **Performance Rating: Accuracy vs Blunder Sensitivity**:
   - Player A: 85% accuracy, 0 blunders $\implies$ high performance rating.
   - Player B: 85% accuracy, 3 blunders $\implies -330$ Elo penalty applied via Article 10773754.
   - Demonstrates that higher accuracy can yield lower performance if errors are catastrophic.

---

### Tier 4: Real-World Benchmark Fixtures
Tests the pipeline against 6 complete reference Chess.com Game Review fixtures:

| Game ID | White Elo | Black Elo | ECO | Opening | White Acc (%) | Black Acc (%) | White Perf | Black Perf | Plies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `184653017586` | 603 | 643 | C50 | Italian Game | 66.1 | 73.3 | 800 | 1100 | 74 |
| `171608609212` | 575 | 572 | D00 | Queen's Pawn Game | 76.4 | 86.2 | 950 | 1300 | 68 |
| `114104460147` | 800 | 1271 | D00 | Queen's Pawn: Mason Attack | 74.3 | 78.8 | 850 | 1500 | 90 |
| `172014464516` | 634 | 639 | B01 | Scandinavian Defense | 87.0 | 81.6 | 1400 | 1300 | 89 |
| `171853838612` | 612 | 616 | C64 | Ruy Lopez: Classical Defense | 83.8 | 76.4 | 1300 | 1250 | 105 |
| `165803154362` | 248 | 281 | B06 | Robatsch Defense | 60.1 | 71.5 | 100 | 800 | 84 |
| **Total** | | | | | | | | | **510** |

#### Acceptance Criteria for Tier 4:
- **Move Classification Agreement**: $> 90.0\%$ overall agreement across all 510 plies.
- **CAPS2 Game Accuracy**: Within $\pm 1.5\%$ of official Chess.com accuracy for each player.
- **Performance Rating**: Within $\pm 50$ Elo points of official Chess.com performance rating for each player.
- **ECO Opening Variation Match**: 100% agreement on opening codes (C50, D00, B01, C64, B06).

---

## 3. Parity Thresholds & Target Inventory

| Metric | Target Threshold | Reference Standard |
| :--- | :--- | :--- |
| Move Classification Agreement | $\ge 90.0\%$ | Chess.com Classification V2 (Article 8572705) |
| CAPS2 Accuracy Parity | $\le \pm 1.5\%$ | Chess.com CAPS2 (Article 8708970) |
| Performance Rating Parity | $\le \pm 50$ Elo points | Chess.com Article 10773754 |
| Win Expectancy Monotonicity | Master $s \le 0.70$ < Novice $s \ge 1.05$ | Expected Points Model $E(cp, R)$ |
| Brilliant Soundness Limit | $\Delta E \le 0.025$, $E_{after} \ge 0.40$ | Article 8572705 & 8584089 |
| Brilliant Contested Ceiling | $cp \le 350$, $E_{before} \le 0.88$ | Article 8572705 & 8584089 |
| Brilliant Endgame Threshold | $piecesCount < 7 \implies$ unique | Article 8572705 & 8584089 |
| Power-Mean Exponent | $p = 0.25$ | CAPS2 Harmonized Specification |

---

## 4. Execution Commands

```bash
# Execute complete standalone parity suite
node tests/test_complete_parity_suite.js

# Execute via package.json alias
npm run test:parity

# Execute via standard test command
npm test
```

---

## 5. Defect Escalation Protocol

When tests encounter failures, they output structured diagnostics with:
1. **Feature / Tier Identification**: Tier 1-4, specific feature category.
2. **Input Parameters**: Values passed to function (`rating`, `cp`, `deltaE`, etc.).
3. **Expected Value**: Authoritative mathematical result or ground truth label.
4. **Actual Value**: Value returned by implementation.
5. **Root Cause Diagnosis**: Specific file, line number, and mathematical reason for divergence.

Implementation defects are escalated to **Agent 1 (Engine & Classification Parity Specialist)** for resolution in Milestone 1.
