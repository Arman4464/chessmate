"use client"

import React, { useContext } from "react"
import RatingSVG from "@/components/svg/rating"
import CoachAvatar from "@/components/svg/coachAvatar"
import { moveRating } from "@/engine/stockfish"
import { AnalyzeContext } from "@/context/analyze"
import RetryTrainer from "../retry/retryTrainer"

const RATING_TITLES: Record<moveRating, string> = {
    brilliant: "Brilliant",
    great: "Great",
    best: "Best",
    excellent: "Excellent",
    good: "Good",
    book: "Book",
    inaccuracy: "Inaccuracy",
    mistake: "Mistake",
    miss: "Miss",
    blunder: "Blunder",
    forced: "Forced",
}

const RATING_COLORS: Record<moveRating, string> = {
    brilliant: "#26c2a3",
    great: "#5c8bb0",
    best: "#81b64c",
    excellent: "#96bc4b",
    good: "#a3b18a",
    book: "#d5a47d",
    inaccuracy: "#f7c631",
    mistake: "#ffa459",
    miss: "#ff7769",
    blunder: "#fa412d",
    forced: "#9e9d9c",
}

const RATING_DEFAULT_EXPLANATIONS: Record<moveRating, string> = {
    brilliant: "Sacrifices material to gain a decisive advantage or unstoppable tactical breakthrough!",
    great: "An energetic move that finds the only path to maintain the initiative!",
    best: "The optimal engine move, maintaining maximum position advantage.",
    excellent: "A strong move that keeps the position firmly in control.",
    good: "A solid choice that continues the plan.",
    book: "Standard opening book theory.",
    inaccuracy: "A slight inaccuracy that relinquishes part of the initiative.",
    mistake: "Overlooks a tactical threat or allows the opponent back into the game.",
    miss: "Missed a critical tactical opportunity to seize the advantage.",
    blunder: "A severe oversight that drastically shifts the game evaluation.",
    forced: "The only legal or reasonable reply.",
}

export function FormatEval(props: { evaluation: string[], white: boolean, smaller?: boolean, best?: boolean }) {
    const { evaluation, white, smaller, best } = props

    const number = (Number(evaluation[1]) / 100) * (white ? 1 : -1)

    let prevChar = ''
    if (number > 0) prevChar = '+'
    if (number < 0) prevChar = '-'

    let text = '0.00'
    if (evaluation[0] === 'mate' && evaluation[1]) {
        text = prevChar + "M" + (Math.abs(Number(evaluation[1])) - Number(Boolean(best)))
    } else if (!evaluation[1]) {
        text = white ? '0-1' : '1-0'
    } else {
        text = prevChar + Math.abs(number).toFixed(2)
    }

    const isWhiteAdvantage = number > 0
    const isBlackAdvantage = number < 0

    return (
        <span
            className={`font-mono font-extrabold tabular-nums select-none tracking-tight inline-flex items-center justify-center border rounded-lg ${
                smaller ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm'
            } ${
                isWhiteAdvantage
                    ? 'bg-white text-[#211f1c] border-white/20 shadow-sm'
                    : isBlackAdvantage
                    ? 'bg-[#181715] text-white border-white/20'
                    : 'bg-[#2b2825] text-neutral-200 border-white/10'
            }`}
        >
            {text}
        </span>
    )
}

function formatBestMove(moveStr?: string) {
    if (!moveStr) return ''
    if (/^[a-h][1-8][a-h][1-8]$/.test(moveStr)) {
        return `${moveStr.slice(0, 2)}-${moveStr.slice(2, 4)}`
    }
    return moveStr
}

export default function Comments(props: {
    rating?: moveRating
    moveSan?: string
    bestMoveSan?: string
    evaluation: string[]
    white: boolean
    comment?: string
}) {
    const { rating, moveSan, bestMoveSan, evaluation, white, comment } = props
    const analyzeContext = useContext(AnalyzeContext)
    const [retryState] = analyzeContext.retryState
    const { startRetry } = analyzeContext
    const [moveNumber] = analyzeContext.moveNumber

    // If Retry mode is active, display the interactive RetryTrainer
    if (retryState.active) {
        return <RetryTrainer />
    }

    if (!rating || !moveSan) {
        return (
            <div className="w-full px-4 pt-3 pb-2 select-none">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">
                        <CoachAvatar size={48} expression="analytical" />
                    </div>
                    <div className="relative flex-1 bg-[#262421] border border-white/10 text-neutral-300 p-3.5 rounded-2xl shadow-md flex items-center gap-3 before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-t-[8px] before:border-t-transparent before:border-b-[8px] before:border-b-transparent before:border-r-[10px] before:border-r-[#262421]">
                        <p className="text-xs md:text-sm font-medium text-neutral-400">
                            Select a move to view detailed positional analysis and tactical breakdown from the coach.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const title = RATING_TITLES[rating] || rating
    const ratingColor = RATING_COLORS[rating] || '#81b64c'
    const showBestMove = Boolean(bestMoveSan && bestMoveSan !== moveSan && rating !== 'best' && rating !== 'book' && rating !== 'brilliant' && rating !== 'forced')
    const canRetry = (rating === 'blunder' || rating === 'mistake' || rating === 'miss') && moveNumber > 0
    const explanation = comment || RATING_DEFAULT_EXPLANATIONS[rating] || ''

    const expression = (rating === 'blunder' || rating === 'mistake' || rating === 'miss')
        ? 'concerned'
        : (rating === 'brilliant' || rating === 'great' || rating === 'best')
        ? 'happy'
        : 'analytical'

    return (
        <div className="w-full px-4 pt-3 pb-2 select-none">
            <div className="flex items-start gap-3">
                {/* Coach Avatar */}
                <div className="flex-shrink-0 pt-1">
                    <CoachAvatar size={48} expression={expression} />
                </div>

                {/* Speech Bubble Container with pointer tail */}
                <div className="relative flex-1 bg-[#262421] text-white p-3.5 rounded-2xl shadow-xl flex flex-col gap-2.5 border border-white/10 before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-t-[8px] before:border-t-transparent before:border-b-[8px] before:border-b-transparent before:border-r-[10px] before:border-r-[#262421]">
                    {/* Header: Badge & Move SAN on left, Score Pill on right */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                            <RatingSVG draggable rating={rating} size={24} />
                            <span className="font-extrabold text-base md:text-lg" style={{ color: ratingColor }}>
                                {title}
                            </span>
                            <span className="font-bold text-white text-sm md:text-base">
                                {moveSan}
                            </span>
                        </div>
                        <FormatEval evaluation={evaluation} white={white} />
                    </div>

                    {/* Analysis explanation */}
                    <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-normal">
                        {explanation}
                    </p>

                    {/* Sub-optimal action row: Best alternative & Retry button */}
                    {(showBestMove || canRetry) && (
                        <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                            {showBestMove && (
                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-300">
                                    <span className="text-neutral-400 font-semibold">Best was</span>
                                    <span className="font-extrabold text-[#81b64c] tracking-wide flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5 fill-[#81b64c]" viewBox="0 0 24 24">
                                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                                        </svg>
                                        {formatBestMove(bestMoveSan)}
                                    </span>
                                </div>
                            )}
                            {canRetry && (
                                <button
                                    type="button"
                                    onClick={() => startRetry(moveNumber)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#81b64c] hover:bg-[#8cc352] active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ml-auto"
                                    title="Try finding the best move from this position"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                                    </svg>
                                    <span>Retry</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}