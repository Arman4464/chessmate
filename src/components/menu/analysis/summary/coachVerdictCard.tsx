"use client"

import React from "react"
import CoachAvatar from "@/components/svg/coachAvatar"
import { players } from "@/context/analyze"
import { move } from "@/engine/stockfish"

export interface CoachVerdictCardProps {
    players?: players
    accuracy: { w: number, b: number }
    result: string
    moves?: move[]
    opening?: { code?: string, name?: string }
}

export default function CoachVerdictCard({
    players,
    accuracy,
    result,
    moves = [],
    opening
}: CoachVerdictCardProps) {
    const whiteName = players?.[0]?.name || "White"
    const blackName = players?.[1]?.name || "Black"

    const isWhiteWinner = result === '1-0'
    const isBlackWinner = result === '0-1'
    const isDraw = result === '1/2-1/2'

    // Tally critical moves for narrative depth
    let whiteBrilliant = 0, blackBrilliant = 0
    let whiteBlunders = 0, blackBlunders = 0

    moves.forEach(m => {
        const color = m.playedBy || (m.color === 'w' ? 'b' : 'w')
        if (m.moveRating === 'brilliant') {
            if (color === 'w') whiteBrilliant++
            else blackBrilliant++
        } else if (m.moveRating === 'blunder') {
            if (color === 'w') whiteBlunders++
            else blackBlunders++
        }
    })

    const winnerName = isWhiteWinner ? whiteName : isBlackWinner ? blackName : null
    const winnerAccuracy = isWhiteWinner ? accuracy.w : isBlackWinner ? accuracy.b : Math.max(accuracy.w, accuracy.b)
    const hasBrilliant = whiteBrilliant > 0 || blackBrilliant > 0
    const highBlunders = whiteBlunders + blackBlunders >= 3

    let headline = "Great game to review!"
    let commentary = "Review each move to see where critical advantages were won and lost."
    let expression: 'happy' | 'neutral' | 'concerned' | 'analytical' = 'happy'

    if (isDraw) {
        expression = 'analytical'
        if (!isNaN(accuracy.w) && !isNaN(accuracy.b) && accuracy.w >= 85 && accuracy.b >= 85) {
            headline = "Masterful Defense & Stalemate"
            commentary = `Both ${whiteName} (${accuracy.w.toFixed(1)}%) and ${blackName} (${accuracy.b.toFixed(1)}%) played at a very high standard, leaving no room for a decisive breakthrough.`
        } else {
            headline = "A Hard-Fought Draw"
            commentary = `A tense battle that ended with shared honors. Both sides navigated complex positions to split the point.`
        }
    } else if (winnerName) {
        if (hasBrilliant) {
            expression = 'happy'
            const finder = whiteBrilliant > 0 ? whiteName : blackName
            headline = "Spectacular Brilliance!"
            commentary = `${finder} discovered an extraordinary sacrifice that completely shifted the evaluation. A stunning tactical finish!`
        } else if (!isNaN(winnerAccuracy) && winnerAccuracy >= 90) {
            expression = 'happy'
            headline = `${winnerName} Played Like a Master!`
            commentary = `Outstanding precision with ${winnerAccuracy.toFixed(1)}% accuracy. ${winnerName} seized early initiative and converted flawlessly.`
        } else if (highBlunders) {
            expression = 'concerned'
            headline = "A Wild Tactical Rollercoaster"
            commentary = `Both sides traded blows and missed opportunities in dynamic complications before ${winnerName} found the decisive blow.`
        } else {
            expression = 'happy'
            headline = `${winnerName} Seized the Day!`
            commentary = `${winnerName} played clean, decisive chess in the critical phases, outmaneuvering the opponent to take the win.`
        }
    } else {
        expression = 'analytical'
        if (opening?.name) {
            headline = `Exploring the ${opening.name}`
            commentary = `Follow along through the key moves to see how the opening plan developed into middlegame tactics.`
        }
    }

    return (
        <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-3.5 shadow-md flex items-start gap-3 relative select-none">
            {/* Coach Avatar with Authentic Styling */}
            <div className="flex-shrink-0 pt-0.5">
                <CoachAvatar size={46} expression={expression} className="rounded-full shadow-md" />
            </div>

            {/* Speech Bubble Container with Left Tail */}
            <div className="relative flex-1 bg-[#312e2b] rounded-xl px-3.5 py-2.5 border border-white/10 shadow-sm before:content-[''] before:absolute before:-left-2 before:top-4 before:w-0 before:h-0 before:border-y-[6px] before:border-y-transparent before:border-r-[8px] before:border-r-[#312e2b]">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black tracking-wide text-[#81b64c] uppercase">Coach Verdict</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">• Game Review</span>
                </div>
                <h4 className="text-sm font-black text-white leading-tight mb-1">
                    {headline}
                </h4>
                <p className="text-xs font-medium text-neutral-300 leading-snug">
                    {commentary}
                </p>
            </div>
        </div>
    )
}
