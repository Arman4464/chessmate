import { moveRating } from "@/engine/stockfish"

export interface RetryState {
    active: boolean
    plyIndex: number
    fen: string
    mistakeSan: string
    mistakeRating: moveRating
    targetBestMoveSan: string
    status: 'idle' | 'success' | 'incorrect'
    attempts: number
    showSolution: boolean
    feedbackMessage: string
}

export const defaultRetryState: RetryState = {
    active: false,
    plyIndex: 0,
    fen: '',
    mistakeSan: '',
    mistakeRating: 'blunder',
    targetBestMoveSan: '',
    status: 'idle',
    attempts: 0,
    showSolution: false,
    feedbackMessage: '',
}
