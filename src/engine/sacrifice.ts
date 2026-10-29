import { Chess } from "chess.js";
import type { Color, Move, PieceSymbol, Square } from "chess.js";

const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
};

/**
 * Checks if a square is attacked by opponent pieces and can be captured profitably.
 * Profit occurs under Chess.com SEE rules when:
 * 1. Attacker is of strictly lower value than target (e.g. minor taking rook/queen, pawn taking any piece).
 * 2. Target is completely undefended by friendly pieces.
 * 3. Opponent has strictly more attackers than friendly defenders.
 */
export function isProfitableCapture(chess: Chess, targetSquare: Square, capturingColor: Color): boolean {
    const legalCaptures = chess.moves({ verbose: true }).filter(m => m.to === targetSquare && m.color === capturingColor);
    if (legalCaptures.length === 0) return false;

    const targetPiece = chess.get(targetSquare);
    if (!targetPiece) return false;
    const targetVal = PIECE_VALUES[targetPiece.type] || 0;

    for (const cap of legalCaptures) {
        const attackerVal = PIECE_VALUES[cap.piece] || 0;
        if (attackerVal < targetVal) return true;

        const friendlyColor: Color = capturingColor === 'w' ? 'b' : 'w';
        const friendlyDefenders = chess.attackers(targetSquare, friendlyColor);
        if (friendlyDefenders.length === 0) return true;
        if (legalCaptures.length > friendlyDefenders.length) return true;
    }

    return false;
}

/**
 * Determines whether a move constitutes a genuine piece or exchange sacrifice per Chess.com rules (Article 8572705).
 * 1. Active sacrifice: Moving a piece or giving up an exchange (Rook for Minor) to a square where it can be profitably captured.
 * 2. Passive sacrifice: Leaving a major or minor piece hanging to execute a devastating tactical threat.
 */
export function isSacrifice(move: Move): boolean {
    const chessBefore = new Chess(move.before);
    const chessAfter = new Chess(move.after);
    const movingColor = move.color;
    const opponentColor: Color = movingColor === 'w' ? 'b' : 'w';

    const movedPiece = move.piece;
    const capturedPiece = move.captured;

    // 1. ACTIVE PIECE / EXCHANGE SACRIFICE
    if (movedPiece !== 'p') {
        const movedVal = PIECE_VALUES[movedPiece] || 0;
        const capturedVal = capturedPiece ? (PIECE_VALUES[capturedPiece] || 0) : 0;
        const materialDeficit = movedVal - capturedVal;

        // Must involve giving up at least an exchange (Rook for Minor: 500 - 320 = 180 cp) or piece (>= 150 cp)
        if (materialDeficit >= 150) {
            if (isProfitableCapture(chessAfter, move.to, opponentColor)) {
                // Ensure the piece wasn't already trapped/doomed on its departure square before
                const wasDoomedBefore = isProfitableCapture(chessBefore, move.from, opponentColor);
                if (!wasDoomedBefore) return true;
            }
        }
    }

    // 2. PASSIVE / VOLUNTEER SACRIFICE: Leaving another major/minor piece hanging elsewhere
    // Only applies if the player was not in check before the move
    if (!chessBefore.inCheck()) {
        const boardAfter = chessAfter.board();
        for (const row of boardAfter) {
            for (const sq of row) {
                if (!sq || sq.color !== movingColor || sq.type === 'p' || sq.type === 'k') continue;
                if (sq.square === move.to) continue;

                if (isProfitableCapture(chessAfter, sq.square, opponentColor)) {
                    // Check if it was safe before the move
                    const wasSafeBefore = !isProfitableCapture(chessBefore, sq.square, opponentColor);
                    if (wasSafeBefore) return true;

                    // Or if it was attacked before, but had an escape/defense before and player chose not to save it:
                    const safeEscapes = chessBefore.moves({ verbose: true, square: sq.square }).filter(m => {
                        const cTest = new Chess(m.after);
                        return !isProfitableCapture(cTest, m.to, opponentColor);
                    });
                    if (safeEscapes.length > 0) return true;
                }
            }
        }
    }

    return false;
}
