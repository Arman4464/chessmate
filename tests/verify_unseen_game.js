const path = require('path');
const { ChessReviewEngine } = require('../review_pipeline.js');

async function runUnseenVerification() {
    console.log('================================================================');
    console.log('   CHESSMATE GAME REVIEW VERIFICATION SUITE (UNSEEN GAMES)');
    console.log('   Algorithmic Parity with Chess.com Classification V2 & CAPS2');
    console.log('================================================================\n');

    const engine = new ChessReviewEngine(2);

    // Unseen Game 1: Donald Byrne vs Bobby Fischer (1956, "Game of the Century")
    // Fischer famously sacrifices his Queen on move 17 (Be6!!)
    const fischerPgn = `[Event "Third Rosenwald Trophy"]
[Site "New York, NY USA"]
[Date "1956.10.17"]
[Round "8"]
[White "Donald Byrne"]
[BlackElo "2600"]
[WhiteElo "2500"]
[Result "0-1"]

1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2# 0-1`;

    console.log('--- Testing Game 1: Byrne vs Fischer (Tactical Queen Sacrifice) ---');
    const res1 = await engine.analyzeGame({
        pgn: fischerPgn,
        whiteElo: 2500,
        blackElo: 2600,
        depth: 18,
        multiPv: 2
    });

    console.log(`White Accuracy: ${res1.accuracies.white}% | Black Accuracy: ${res1.accuracies.black}%`);
    console.log(`Performance Rating: White=${res1.performanceRatings.white}, Black=${res1.performanceRatings.black}`);
    console.log(`White Tallies:`, res1.tallies.white);
    console.log(`Black Tallies:`, res1.tallies.black);

    // Verify Fischer's Queen sacrifice (Be6 at ply 34)
    const be6Move = res1.moves.find(m => m.ply === 34);
    if (be6Move) {
        console.log(`Fischer 17... Be6: classification="${be6Move.classification}", CAPS2=${be6Move.caps2}, comment="${be6Move.comment}"`);
    }

    // Verify mate delivery move
    const mateMove = res1.moves[res1.moves.length - 1];
    console.log(`Final Move ${mateMove.san}: classification="${mateMove.classification}", CAPS2=${mateMove.caps2}\n`);

    // Basic assertions
    if (res1.accuracies.black < 80) throw new Error(`Expected Fischer accuracy >= 80%, got ${res1.accuracies.black}%`);
    if (res1.accuracies.black <= res1.accuracies.white) throw new Error('Fischer should have higher accuracy than Byrne');
    if (!mateMove || mateMove.classification !== 'best') throw new Error('Final checkmate should be classified as Best');

    console.log('--- Testing Game 2: Club Amateur Game (With Blunders & Turnarounds) ---');
    const amateurPgn = `[Event "Casual Rapid"]
[White "ClubPlayer1"]
[Black "ClubPlayer2"]
[WhiteElo "1250"]
[BlackElo "1200"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

    const res2 = await engine.analyzeGame({
        pgn: amateurPgn,
        whiteElo: 1250,
        blackElo: 1200,
        depth: 18,
        multiPv: 2
    });

    console.log(`White Accuracy: ${res2.accuracies.white}% | Black Accuracy: ${res2.accuracies.black}%`);
    console.log(`Scholar's Mate 3... Nf6??:`, res2.moves[5]);
    console.log(`Scholar's Mate 4. Qxf7#:`, res2.moves[6]);

    if (res2.moves[5].classification !== 'blunder') {
        throw new Error(`Expected 3... Nf6 to be a blunder allowing mate, got ${res2.moves[5].classification}`);
    }

    console.log('\n================================================================');
    console.log('   ALL UNSEEN VERIFICATION TESTS PASSED SUCCESSFULLY!          ');
    console.log('================================================================\n');
}

runUnseenVerification().catch((err) => {
    console.error('VERIFICATION FAILED:', err);
    process.exit(1);
});
