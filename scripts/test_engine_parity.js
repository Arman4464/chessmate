/**
 * Parity Test Suite for Worker M1 Engine Tasks
 * Verifies all 8 tasks:
 * 1. Win expectancy formula and rating sensitivity scaling
 * 2. Static Exchange Evaluation (SEE) minimax algorithm
 * 3. 4-part Brilliant Move (!!) sacrifice logic
 * 4. Miss classification triggers
 * 5. 11 Move Classifications calibration
 * 6. CAPS2 Game Accuracy power-mean blend (p = 0.25)
 * 7. Universal Single-Game Performance Rating (Article 10773754)
 * 8. Clean execution and parity across files
 */

const assert = require('assert');
const { Chess } = require('chess.js');
const {
    winExpectancy,
    calculateDeltaE,
    caps2MoveAccuracy,
    calculateCaps2GameAccuracy,
    calculatePerformanceRating,
    classifyMove,
    see,
    staticExchangeEvaluation,
    isAuthenticSacrifice
} = require('../src/engine/classificationTree.ts');

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        throw err;
    }
}

console.log('--- Testing Task 1: Win Expectancy & Rating Sensitivity Scaling ---');

it('winExpectancy clamps at ±50000 centipawns', () => {
    assert.strictEqual(winExpectancy(50000, 1500), 1.0);
    assert.strictEqual(winExpectancy(100000, 2000), 1.0);
    assert.strictEqual(winExpectancy(-50000, 1500), 0.0);
    assert.strictEqual(winExpectancy(-99999, 1200), 0.0);
});

it('winExpectancy converts advantage with steeper curve for higher ratings', () => {
    const cp = 150;
    const eNovice = winExpectancy(cp, 600);
    const eIntermediate = winExpectancy(cp, 1500);
    const eMaster = winExpectancy(cp, 2500);

    // Masters convert leads more reliably -> eMaster > eIntermediate > eNovice
    assert.ok(eMaster > eIntermediate, `eMaster (${eMaster}) should be > eIntermediate (${eIntermediate})`);
    assert.ok(eIntermediate > eNovice, `eIntermediate (${eIntermediate}) should be > eNovice (${eNovice})`);

    // Verify sensitivity scaling s(R) values
    const sNovice = Math.max(0.60, Math.min(1.40, 1.35 - 0.35 * (600 / 1000)));
    const sIntermediate = Math.max(0.60, Math.min(1.40, 1.35 - 0.35 * (1500 / 1000)));
    const sMaster = Math.max(0.60, Math.min(1.40, 1.35 - 0.35 * (2500 / 1000)));

    assert.ok(sNovice > sIntermediate, 'sNovice should be larger than sIntermediate');
    assert.ok(sIntermediate > sMaster, 'sIntermediate should be larger than sMaster');
    assert.strictEqual(sMaster, 0.60, 'sMaster should clamp at 0.60');
});

it('winExpectancy is symmetric around 0 centipawns', () => {
    assert.strictEqual(Number(winExpectancy(0, 1500).toFixed(4)), 0.5000);
    const ePos = winExpectancy(200, 1600);
    const eNeg = winExpectancy(-200, 1600);
    assert.strictEqual(Number((ePos + eNeg).toFixed(4)), 1.0000);
});

console.log('\n--- Testing Task 2: Static Exchange Evaluation (SEE) Minimax ---');

it('SEE evaluates free hanging piece capture as positive material gain', () => {
    // White Queen on d1 captures undefended black knight on d5 (d-file open)
    const chess = new Chess('rnb1kb1r/ppp1pppp/8/3n4/8/8/PPP2PPP/RNBQKBNR w KQkq - 0 1');
    // d1 to d5 is legal
    const val = see(chess, 'd1', 'd5');
    assert.strictEqual(val, 300, `Expected 300 centipawns, got ${val}`);
});

it('SEE evaluates Queen taking protected pawn as negative material exchange', () => {
    // Black pawn on e5 defended by pawn on d6. White Queen on h5 takes e5.
    const chess = new Chess('rnbqkbnr/ppp2ppp/3p4/4p2Q/8/4P3/PPPP1PPP/RNB1KBNR w KQkq - 0 1');
    const val = see(chess, 'h5', 'e5');
    // White captures Pawn (100), Black pawn d6 takes Queen (900), net -800
    assert.strictEqual(val, -800, `Expected -800 centipawns, got ${val}`);
});

it('SEE evaluates equal piece trades as 0', () => {
    // White knight on f3 takes black knight on d4 defended by pawn c7
    const chess = new Chess('r1bqkbnr/ppp1pppp/8/8/3n4/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1');
    const val = see(chess, 'f3', 'd4');
    // White takes Knight (300), Black takes Knight (300), net 0
    assert.strictEqual(val, 0, `Expected 0 centipawns, got ${val}`);
});

it('SEE evaluates exchange sacrifice (Rook for Knight) as -200', () => {
    // White Rook on e1 takes black knight on e4 defended by d5 pawn
    const chess = new Chess('r1bqkbnr/ppp2ppp/8/3p4/4n3/8/PPPP1PPP/RNB1RBK1 w - - 0 1');
    const val = see(chess, 'e1', 'e4');
    // White takes Knight (300), Black pawn takes Rook (500), net -200
    assert.strictEqual(val, -200, `Expected -200 centipawns, got ${val}`);
});

it('SEE handles quiet volunteer piece sacrifice on attacked square', () => {
    // White bishop moves to d5, attacked by c6 pawn, with no recapture
    const chess = new Chess('rnbqkbnr/pp2pppp/2p5/8/4B3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 1');
    const val = see(chess, 'e4', 'd5');
    // Empty square (0), Black pawn takes Bishop (300), net -300
    assert.strictEqual(val, -300, `Expected -300 centipawns, got ${val}`);
});

it('isAuthenticSacrifice identifies authentic Greek Gift sacrifice', () => {
    // Classic Greek gift position: Bishop on d3 captures h7 defended by King on g8
    const chess = new Chess('r1bq1rk1/ppp2ppp/2n1pn2/8/3P4/3B1N2/PPP2PPP/RNBQ1RK1 w - - 0 1');
    const isSac = isAuthenticSacrifice(chess, { from: 'd3', to: 'h7', color: 'w' });
    assert.strictEqual(isSac, true, 'Greek Gift Bxh7+ should be identified as an authentic sacrifice');
});

console.log('\n--- Testing Task 3: 4-Part Brilliant Move (!!) Logic ---');

it('qualifying sound sacrifice in contested middlegame is classified as Brilliant', () => {
    const res = classifyMove({
        playerScoreBefore: 120,
        playerScoreAfter: 200,
        playerRating: 1500,
        isBestMove: true,
        isBookMove: false,
        isForced: false,
        isSacrifice: true,
        piecesCount: 14,
        secondBestScore: 80
    });
    assert.strictEqual(res.classification, 'brilliant');
    assert.strictEqual(res.accuracy, 100.0);
});

it('sacrifice fails Brilliant if position was already decisively winning before', () => {
    // Score before is +400 cp (> 350 cp cutoff) and beforeE > 0.88
    const res = classifyMove({
        playerScoreBefore: 450,
        playerScoreAfter: 500,
        playerRating: 1500,
        isBestMove: true,
        isBookMove: false,
        isForced: false,
        isSacrifice: true,
        piecesCount: 12
    });
    assert.notStrictEqual(res.classification, 'brilliant', 'Should not award Brilliant if already won');
});

it('sacrifice fails Brilliant if position is losing after move', () => {
    // Player drops to -100 cp (afterE < 0.40)
    const res = classifyMove({
        playerScoreBefore: 50,
        playerScoreAfter: -100,
        playerRating: 1500,
        isBestMove: false,
        isBookMove: false,
        isForced: false,
        isSacrifice: true,
        piecesCount: 12
    });
    assert.notStrictEqual(res.classification, 'brilliant', 'Unsound sacrifice must not be Brilliant');
});

it('endgame sacrifice requires Multi-PV 2 uniqueness (< 7 pieces)', () => {
    // Endgame with 5 pieces.
    // Case A: Second best move is also sound and close (deltaE_gap < 0.12, secondBestE >= 0.40) -> Not unique!
    const resNonUnique = classifyMove({
        playerScoreBefore: 100,
        playerScoreAfter: 180,
        playerRating: 1500,
        isBestMove: true,
        isBookMove: false,
        isForced: false,
        isSacrifice: true,
        piecesCount: 5,
        secondBestScore: 160 // second-best is +160 cp (strong alternative)
    });
    assert.notStrictEqual(resNonUnique.classification, 'brilliant', 'Endgame sacrifice must be unique continuation');

    // Case B: Second best move is losing (secondBestScore = -150 cp, secondBestE < 0.40) -> Unique!
    const resUnique = classifyMove({
        playerScoreBefore: 100,
        playerScoreAfter: 200,
        playerRating: 1500,
        isBestMove: true,
        isBookMove: false,
        isForced: false,
        isSacrifice: true,
        piecesCount: 5,
        secondBestScore: -150
    });
    assert.strictEqual(resUnique.classification, 'brilliant', 'Unique endgame sacrifice should be Brilliant');
});

console.log('\n--- Testing Task 4: Miss Classification ---');

it('misses forced checkmate sequence', () => {
    // Player had mate in 2 (eval >= 90000) and played a move dropping out of forced mate
    const res = classifyMove({
        playerScoreBefore: 99800,
        playerScoreAfter: 350,
        playerRating: 1500,
        isBestMove: false,
        isBookMove: false,
        isForced: false,
        isSacrifice: false,
        piecesCount: 10
    });
    assert.strictEqual(res.classification, 'miss');
    assert.ok(res.accuracy <= 18.0, `Miss accuracy should be <= 18.0, got ${res.accuracy}`);
});

it('blows a decisive winning advantage', () => {
    // Player was +300 cp and drops to 0 cp (deltaCp = 300, deltaE > 0.20)
    const res = classifyMove({
        playerScoreBefore: 300,
        playerScoreAfter: 0,
        playerRating: 1500,
        isBestMove: false,
        isBookMove: false,
        isForced: false,
        isSacrifice: false,
        piecesCount: 12
    });
    assert.strictEqual(res.classification, 'miss');
});

it('fails to punish opponent blunder', () => {
    // Opponent blundered, player fails to punish with significant equity drop and finishes < 150 cp
    const res = classifyMove({
        playerScoreBefore: 20,
        playerScoreAfter: -80,
        playerRating: 1500,
        isBestMove: false,
        isBookMove: false,
        isForced: false,
        isSacrifice: false,
        piecesCount: 12,
        opponentPreviousRating: 'blunder'
    });
    assert.strictEqual(res.classification, 'miss');
});

console.log('\n--- Testing Task 5: All 11 Move Classifications ---');

it('correctly classifies Book, Forced, Best, Great, Excellent, Good, Inaccuracy, Mistake, Blunder', () => {
    // 1. Book
    const cBook = classifyMove({
        playerScoreBefore: 0, playerScoreAfter: 0, isBestMove: true, isBookMove: true, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cBook.classification, 'book');
    assert.strictEqual(cBook.accuracy, 100.0);

    // 2. Forced
    const cForced = classifyMove({
        playerScoreBefore: 0, playerScoreAfter: 0, isBestMove: true, isBookMove: false, isForced: true, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cForced.classification, 'forced');
    assert.strictEqual(cForced.accuracy, 100.0);

    // 3. Best
    const cBest = classifyMove({
        playerScoreBefore: 50, playerScoreAfter: 50, isBestMove: true, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cBest.classification, 'best');
    assert.strictEqual(cBest.accuracy, 100.0);

    // 4. Great (only good move with MultiPV gap)
    const cGreat = classifyMove({
        playerScoreBefore: 20, playerScoreAfter: 80, isBestMove: true, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16,
        secondBestScore: -100 // large gap
    });
    assert.strictEqual(cGreat.classification, 'great');
    assert.strictEqual(cGreat.accuracy, 100.0);

    // 5. Excellent (0.00 < deltaE < 0.02)
    const cExcellent = classifyMove({
        playerScoreBefore: 100, playerScoreAfter: 95, isBestMove: false, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cExcellent.classification, 'excellent');
    assert.ok(cExcellent.accuracy >= 93.0);

    // 6. Good (0.02 <= deltaE < 0.05)
    const cGood = classifyMove({
        playerScoreBefore: 100, playerScoreAfter: 80, isBestMove: false, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cGood.classification, 'good');

    // 7. Inaccuracy (0.05 <= deltaE < 0.10)
    const cInaccuracy = classifyMove({
        playerScoreBefore: 100, playerScoreAfter: 50, isBestMove: false, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cInaccuracy.classification, 'inaccuracy');

    // 8. Mistake (0.10 <= deltaE < 0.20)
    const cMistake = classifyMove({
        playerScoreBefore: 100, playerScoreAfter: -10, isBestMove: false, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cMistake.classification, 'mistake');

    // 9. Blunder (deltaE >= 0.20 or blundered mate)
    const cBlunder = classifyMove({
        playerScoreBefore: 50, playerScoreAfter: -95000, isBestMove: false, isBookMove: false, isForced: false, isSacrifice: false, piecesCount: 16
    });
    assert.strictEqual(cBlunder.classification, 'blunder');
    assert.strictEqual(cBlunder.accuracy, 0.0);
});

console.log('\n--- Testing Task 6: CAPS2 Game Accuracy Power-Mean Aggregation (p = 0.25) ---');

it('calculates CAPS2 game accuracy using calibrated harmonic power-mean blend', () => {
    // All 100s -> 100.0%
    assert.strictEqual(calculateCaps2GameAccuracy([100, 100, 100, 100]), 100.0);

    // Empty array -> 100.0%
    assert.strictEqual(calculateCaps2GameAccuracy([]), 100.0);

    // Game with a blunder (0%): should be appropriately dragged down rather than inflated by arithmetic mean
    const accsWithBlunder = [100, 95, 90, 85, 0];
    const arithMean = accsWithBlunder.reduce((a, b) => a + b, 0) / accsWithBlunder.length; // 74.0%
    const caps2Acc = calculateCaps2GameAccuracy(accsWithBlunder, 0.25, 0.75);

    assert.ok(caps2Acc < arithMean, `CAPS2 (${caps2Acc}) should be lower than arithmetic mean (${arithMean}) due to blunder`);
    assert.ok(caps2Acc >= 40.0 && caps2Acc <= 60.0, `Expected ~45-55%, got ${caps2Acc}`);
});

console.log('\n--- Testing Task 7: Universal Single-Game Estimated Performance Rating (Article 10773754) ---');

it('computes Performance Rating according to Article 10773754 specifications', () => {
    // 1. 1200 player with 95% accuracy and 0 blunders/mistakes/misses:
    // Expected acc = 68 + (1200 - 1000) * 0.015 = 71.0%
    // Delta acc = (95 - 71) * 26 = +624
    // Performance = 1200 + 624 = 1824 -> rounded to nearest 50 = 1800
    const perf1 = calculatePerformanceRating(1200, 95, { blunder: 0, mistake: 0, miss: 0 });
    assert.strictEqual(perf1, 1800, `Expected 1800, got ${perf1}`);

    // 2. 1500 player with 80% accuracy, 2 blunders, 0 mistakes, 1 miss:
    // Expected acc = 68 + (1500 - 1000) * 0.015 = 75.5%
    // Delta acc = (80 - 75.5) * 26 = +117
    // Delta err = -(2 * 110) - (0 * 45) - (1 * 25) = -245
    // Performance = 1500 + 117 - 245 = 1372 -> rounded to nearest 50 = 1350
    const perf2 = calculatePerformanceRating(1500, 80, { blunder: 2, mistake: 0, miss: 1 });
    assert.strictEqual(perf2, 1350, `Expected 1350, got ${perf2}`);

    // 3. Rating clamping at [100, 3200]
    const perfHigh = calculatePerformanceRating(3000, 99, {});
    assert.ok(perfHigh <= 3200, `Should clamp at 3200, got ${perfHigh}`);
    const perfLow = calculatePerformanceRating(300, 20, { blunder: 10 });
    assert.ok(perfLow >= 100, `Should clamp at 100, got ${perfLow}`);
});

console.log(`\n========================================`);
console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
console.log(`========================================\n`);
