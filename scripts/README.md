# Chess Review System Architecture & Validation

This directory contains utility and verification tools for replicating official Chess.com Game Review behavior (Classification V2, Expected Points Model, and CAPS2 accuracy scoring).

## Core Mathematical Models (Official 2026 Chess.com Standards)

### 1. Expected Points Model (Win Expectancy)
$$\text{Win Expectancy } E(cp, R) = \frac{1}{1 + 10^{-cp / (400 \cdot s(R))}}$$
where $s(R) = \max(0.60, \min(1.40, 0.65 + 0.25 \cdot (R / 1000)))$.

### 2. Move Classification Boundaries ($\Delta E = \max(0, E_{before} - E_{after})$)
- **Best**: $\Delta E = 0.00$ (engine #1 choice)
- **Excellent**: $0.00 < \Delta E \le 0.02$
- **Good**: $0.02 < \Delta E \le 0.05$
- **Inaccuracy**: $0.05 < \Delta E \le 0.10$
- **Mistake**: $0.10 < \Delta E \le 0.20$
- **Blunder**: $\Delta E > 0.20$
- **Brilliant (!!)**: Piece sacrifice (SEE / piece delta) maintaining advantage ($E_{after} \ge 0.40$), contested position before ($cp \le 350, E_{before} \le 0.85$), sole winning path in endgames.
- **Great (!)**: Critical turnaround ($E_{before} \le 0.32 \rightarrow E_{after} \ge 0.48$), decisive breakthrough, or MultiPV 2 gap $\ge 120-140$ cp.
- **Miss (🔭)**: Failing to punish an opponent mistake/blunder from immediately preceding ply, or missing a forced mate.
- **Book (📖)**: Recognized opening theory in ECO tree.
- **Forced**: Exactly 1 legal move.

### 3. CAPS2 Move Accuracy Curve (Article 8708970)
$$\Delta_{loss} = (\Delta E \cdot 100) + \Delta cp_{penalty} \cdot winScale$$
$$A(\Delta_{loss}, R) = 103.1668 \cdot e^{-0.055 \cdot \Delta_{loss} \cdot (R/1000)^{-0.2}} - 3.1668$$
- For book moves, top engine choices, or $\Delta cp \le 10$: $A = 100\%$.
- Forced moves and book moves are excluded from game accuracy aggregation.

### 4. Game Accuracy Power-Mean Aggregation
$$M_p = \left( \frac{1}{n} \sum_{i=1}^n A_i^p \right)^{1/p} \quad (p = 0.35)$$
$$\text{Game Accuracy} = 0.75 \cdot M_p + 0.25 \cdot M_{arithmetic}$$

### 5. Performance Game Rating (Article 10773754)
$$Acc_{expected} = \min(95, \max(55, 68 + (R - 1000) \cdot 0.015))$$
$$\text{Game Rating} = \text{round}_{50}(R + (Acc - Acc_{expected}) \cdot 26 - (\text{blunders} \cdot 110) - (\text{mistakes} \cdot 45) - (\text{misses} \cdot 25))$$
