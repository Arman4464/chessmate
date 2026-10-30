import { moveRating } from "@/engine/stockfish"

export interface KeyMoment {
    id: number // 1-based sequential index (1 to N)
    plyIndex: number // Index in the game[] array
    moveNumber: number // Full turn number (e.g. 14)
    turnColor: 'w' | 'b'
    san: string
    rating: moveRating
    title: string
    description: string
    bestMoveSan?: string
}
