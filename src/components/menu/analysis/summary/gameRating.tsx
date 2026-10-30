"use client"

import { moveRating } from "@/engine/stockfish"
import { avg } from "./playersAccuracy"
import RatingSVG from "@/components/svg/rating"
import { players } from "@/context/analyze"

function topElo(elo: number | string | undefined): string {
    if (elo === undefined || elo === null) return "—"
    const parsed = typeof elo === 'number' ? elo : parseInt(String(elo), 10)
    if (isNaN(parsed) || parsed <= 0) return "—"
    const MAX_ELO = 3200
    if (parsed > MAX_ELO) return `${MAX_ELO}+`
    if (parsed < 200) return '200'
    return String(Math.round(parsed / 25) * 25)
}

export function getPerformanceRating(accuracy: number, playerElo?: string | number): number {
    if (isNaN(accuracy) || accuracy <= 0) return 0

    const parsedElo = typeof playerElo === 'number' ? playerElo : parseInt(String(playerElo), 10)
    const hasValidElo = !isNaN(parsedElo) && parsedElo > 200 && parsedElo < 3500

    // Universal Single-Game Estimated Performance Rating Model (Article 10773754)
    let basePerf = 800
    if (accuracy >= 98) basePerf = 2750 + (accuracy - 98) * 150
    else if (accuracy >= 90) basePerf = 2000 + (accuracy - 90) * 80
    else if (accuracy >= 80) basePerf = 1500 + (accuracy - 80) * 50
    else if (accuracy >= 70) basePerf = 1100 + (accuracy - 70) * 40
    else if (accuracy >= 60) basePerf = 800 + (accuracy - 60) * 30
    else basePerf = Math.max(300, 400 + accuracy * 6.5)

    if (hasValidElo) {
        // Blend 30% baseline Elo and 70% game accuracy performance
        const blended = 0.30 * parsedElo + 0.70 * basePerf
        return Math.round(blended / 25) * 25
    }

    return Math.round(basePerf / 25) * 25
}

function getRatingPhase(accuracy: number[]) {
    const avgAccuracy = avg(accuracy)
    if (accuracy.length < 2) return { rating: null, accuracy: null }

    let rating: moveRating
    if (avgAccuracy >= 95) rating = 'great'
    else if (avgAccuracy >= 90) rating = 'best'
    else if (avgAccuracy >= 80) rating = 'excellent'
    else if (avgAccuracy >= 60) rating = 'good'
    else if (avgAccuracy >= 40) rating = 'inaccuracy'
    else if (avgAccuracy >= 20) rating = 'mistake'
    else rating = 'blunder'

    return { rating, accuracy: avgAccuracy.toFixed(0) + '%' }
}

function RatingIcon(props: { ratingPhase: { rating: moveRating | null, accuracy: string | null }, titleText: string }) {
    const { titleText, ratingPhase } = props
    const { rating, accuracy } = ratingPhase

    if (!rating || !accuracy) return <span className="text-neutral-500 font-bold text-xs">—</span>

    return (
        <div className="flex items-center gap-1.5" title={`${titleText}: ${accuracy}`}>
            <RatingSVG draggable rating={rating} size={20} />
            <span className="text-xs font-bold text-neutral-300 tabular-nums">{accuracy}</span>
        </div>
    )
}

function EloShield({ color = "#81b64c" }: { color?: string }) {
    return (
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" className="flex-shrink-0 drop-shadow-sm">
            <path
                d="M12 1L2 5V13C2 20 6.5 25.5 12 27C17.5 25.5 22 20 22 13V5L12 1Z"
                fill={color}
                fillOpacity="0.18"
                stroke={color}
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M12 4L4 7.5V13.5C4 18.5 7.5 22.5 12 24C16.5 22.5 20 18.5 20 13.5V7.5L12 4Z"
                fill={color}
            />
            <path
                d="M12 7L13.4 10.4H17L14.2 12.6L15.2 16L12 13.8L8.8 16L9.8 12.6L7 10.4H10.6L12 7Z"
                fill="#ffffff"
            />
        </svg>
    )
}

function getRatingTierLabel(ratingNum: number): string {
    if (ratingNum >= 2600) return "Grandmaster"
    if (ratingNum >= 2400) return "Senior Master"
    if (ratingNum >= 2200) return "Master"
    if (ratingNum >= 2000) return "Candidate Master"
    if (ratingNum >= 1800) return "Class A / Expert"
    if (ratingNum >= 1600) return "Class B"
    if (ratingNum >= 1400) return "Intermediate"
    if (ratingNum >= 1200) return "Casual Player"
    return "Beginner"
}

export default function GameRating(props: {
    reducedSummary?: boolean
    players?: players
    accuracy: { w: number, b: number }
    accuracyPhases: {
        opening: { w: number[], b: number[] }
        middlegame: { w: number[], b: number[] }
        endgame: { w: number[], b: number[] }
    }
}) {
    const { accuracy, accuracyPhases, players } = props

    const whiteNumeric = players?.[0]?.performanceRating ?? getPerformanceRating(accuracy.w, players?.[0]?.elo)
    const blackNumeric = players?.[1]?.performanceRating ?? getPerformanceRating(accuracy.b, players?.[1]?.elo)

    const whiteRating = topElo(whiteNumeric)
    const blackRating = topElo(blackNumeric)

    return (
        <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-4 shadow-md flex flex-col gap-3.5 select-none">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-neutral-400 uppercase">
                    Performance Rating
                </span>
                <span className="text-[11px] text-neutral-400 font-semibold">
                    Article 10773754
                </span>
            </div>

            {/* Performance Rating Cards */}
            <div className="grid grid-cols-2 gap-3">
                {/* White Elo Card */}
                <div className="bg-[#312e2b] rounded-xl p-3 border border-white/5 flex items-center gap-3 relative">
                    <EloShield color="#81b64c" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-neutral-400 font-bold truncate">
                            {players?.[0]?.name || 'White'}
                        </span>
                        <span className="text-xl font-black text-white tabular-nums leading-none my-0.5">
                            {whiteRating}
                        </span>
                        <span className="text-[10px] text-[#81b64c] font-black truncate">
                            {getRatingTierLabel(whiteNumeric)}
                        </span>
                    </div>
                </div>

                {/* Black Elo Card */}
                <div className="bg-[#312e2b] rounded-xl p-3 border border-white/5 flex items-center gap-3 relative">
                    <EloShield color="#5c8bb0" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-neutral-400 font-bold truncate">
                            {players?.[1]?.name || 'Black'}
                        </span>
                        <span className="text-xl font-black text-white tabular-nums leading-none my-0.5">
                            {blackRating}
                        </span>
                        <span className="text-[10px] text-[#5c8bb0] font-black truncate">
                            {getRatingTierLabel(blackNumeric)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Phase Breakdown Sub-Table */}
            <div className="bg-[#1e1d1a]/50 rounded-xl p-2.5 border border-white/5 flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 px-1 mb-0.5">
                    Game Phases
                </span>

                {/* Opening Phase */}
                <div className="grid grid-cols-[80px_1fr_1fr] items-center px-1 py-1 rounded hover:bg-white/5 transition-colors">
                    <span className="text-xs font-bold text-neutral-300">Opening</span>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.opening.w)} titleText="White Opening" />
                    </div>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.opening.b)} titleText="Black Opening" />
                    </div>
                </div>

                {/* Middlegame Phase */}
                <div className="grid grid-cols-[80px_1fr_1fr] items-center px-1 py-1 rounded hover:bg-white/5 transition-colors">
                    <span className="text-xs font-bold text-neutral-300">Middlegame</span>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.middlegame.w)} titleText="White Middlegame" />
                    </div>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.middlegame.b)} titleText="Black Middlegame" />
                    </div>
                </div>

                {/* Endgame Phase */}
                <div className="grid grid-cols-[80px_1fr_1fr] items-center px-1 py-1 rounded hover:bg-white/5 transition-colors">
                    <span className="text-xs font-bold text-neutral-300">Endgame</span>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.endgame.w)} titleText="White Endgame" />
                    </div>
                    <div className="flex justify-center">
                        <RatingIcon ratingPhase={getRatingPhase(accuracyPhases.endgame.b)} titleText="Black Endgame" />
                    </div>
                </div>
            </div>
        </div>
    )
}