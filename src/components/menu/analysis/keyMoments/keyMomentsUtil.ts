import type { move } from "@/engine/stockfish"
import type { KeyMoment } from "./types"

export function extractKeyMoments(game: move[]): KeyMoment[] {
    if (!game || game.length <= 1) return []

    const moments: KeyMoment[] = []
    let counter = 1

    for (let i = 1; i < game.length; i++) {
        const m = game[i]
        const rating = m.moveRating
        if (!rating) continue

        const prevMove = game[i - 1]
        const turnColor = m.color ?? (i % 2 === 1 ? 'w' : 'b')
        const side = turnColor === 'w' ? 'White' : 'Black'
        const moveNumber = Math.ceil(i / 2)
        const bestAlternative = prevMove?.bestMoveSan

        let title = ''
        let description = ''
        let isPivotal = false

        if (rating === 'blunder') {
            isPivotal = true
            title = 'Blunder'
            description = `${side} played ${m.san}, a critical oversight that shifts the evaluation decisively.`
        } else if (rating === 'miss') {
            isPivotal = true
            const wasWinning = (m.scoreBefore ?? 0) >= 200
            title = wasWinning ? 'Missed Win' : 'Missed Opportunity'
            description = `${side} played ${m.san}, overlooking a tactical breakthrough or winning sequence.`
        } else if (rating === 'mistake') {
            isPivotal = true
            title = 'Mistake'
            description = `${side} played ${m.san}, a slip that concedes the initiative to the opponent.`
        } else if (rating === 'brilliant') {
            isPivotal = true
            title = 'Brilliant Move'
            description = `${side} found ${m.san}, an extraordinary piece sacrifice with unstoppable follow-up!`
        } else if (rating === 'great') {
            isPivotal = true
            title = 'Great Move'
            description = `${side} found ${m.san}, the only critical defense or attack to retain advantage.`
        } else if (rating === 'inaccuracy' && m.deltaE && m.deltaE >= 0.20) {
            isPivotal = true
            title = 'Turning Point'
            description = `${side}'s ${m.san} caused a substantial shift in the game's momentum.`
        }

        if (isPivotal) {
            moments.push({
                id: counter++,
                plyIndex: i,
                moveNumber,
                turnColor,
                san: m.san ?? `Move ${i}`,
                rating,
                title,
                description,
                bestMoveSan: bestAlternative,
            })
        }
    }

    return moments
}
