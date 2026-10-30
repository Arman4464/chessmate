"use client"

import RatingSVG from "@/components/svg/rating"
import { move, moveRating } from "@/engine/stockfish"
import { useEffect, useState } from "react"

const ratings: moveRating[] = [
    "brilliant",
    "great",
    "best",
    "excellent",
    "good",
    "book",
    "inaccuracy",
    "mistake",
    "miss",
    "blunder",
]

function title(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

const ratingColorMap: Record<moveRating, string> = {
    brilliant: '#26c2a3',
    great: '#5c8bb0',
    best: '#81b64c',
    excellent: '#96bc4b',
    good: '#a3b18a',
    book: '#d5a47d',
    inaccuracy: '#f7c631',
    mistake: '#ffa459',
    miss: '#ff7769',
    blunder: '#fa412d',
    forced: '#9e9d9c',
}

interface CountPillProps {
    count: number
    color: string
}

function CountPill({ count, color }: CountPillProps) {
    if (count > 0) {
        return (
            <div
                className="min-w-[32px] h-6 px-2.5 rounded-full flex items-center justify-center text-xs font-black tabular-nums text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: color }}
            >
                {count}
            </div>
        )
    }

    return (
        <div className="min-w-[32px] h-6 px-2 rounded-full flex items-center justify-center text-xs font-bold tabular-nums bg-white/5 text-neutral-500 border border-white/5">
            0
        </div>
    )
}

export default function RatingCount(props: { moves: move[] }) {
    const [counter, setCounter] = useState<{ w: Record<string, number>, b: Record<string, number> }>({ w: {}, b: {} })
    const { moves } = props

    useEffect(() => {
        const newCounter: { w: Record<string, number>, b: Record<string, number> } = { w: {}, b: {} }
        ratings.forEach(r => {
            newCounter.w[r] = 0
            newCounter.b[r] = 0
        })

        moves.forEach((move) => {
            if (!move.moveRating) return
            const rating = move.moveRating as string
            if (rating === 'forced') return
            const key = rating.includes('book') ? 'book' : rating

            const playerColor = move.playedBy || (move.color === 'w' ? 'b' : 'w')

            if (newCounter[playerColor] && newCounter[playerColor][key] !== undefined) {
                newCounter[playerColor][key]++
            }
        })
        setCounter(newCounter)
    }, [moves])

    return (
        <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-4 shadow-md flex flex-col gap-2 select-none">
            {/* Header */}
            <div className="grid grid-cols-[1fr_64px_64px] items-center pb-2 border-b border-white/10 text-[11px] font-black text-neutral-400 uppercase tracking-wider px-2">
                <span>Move Classification</span>
                <span className="text-center flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white inline-block" /> White
                </span>
                <span className="text-center flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-neutral-600 border border-white/30 inline-block" /> Black
                </span>
            </div>

            {/* List of classifications */}
            <div className="flex flex-col gap-1">
                {ratings.map(rating => {
                    const titleRating = title(rating)
                    const color = ratingColorMap[rating] || '#ffffff'
                    const wCount = counter.w[rating] ?? 0
                    const bCount = counter.b[rating] ?? 0
                    const hasMoves = wCount > 0 || bCount > 0

                    return (
                        <div
                            key={rating}
                            className={`grid grid-cols-[1fr_64px_64px] items-center px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                                hasMoves ? 'opacity-100' : 'opacity-45'
                            }`}
                        >
                            {/* Classification Glyph & Label */}
                            <div className="flex items-center gap-2.5 min-w-0">
                                <RatingSVG draggable className="select-none flex-shrink-0" rating={rating} size={20} />
                                <span className="font-bold text-xs text-neutral-200 truncate">{titleRating}</span>
                            </div>

                            {/* White Count Pill */}
                            <div className="flex justify-center">
                                <CountPill count={wCount} color={color} />
                            </div>

                            {/* Black Count Pill */}
                            <div className="flex justify-center">
                                <CountPill count={bCount} color={color} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}