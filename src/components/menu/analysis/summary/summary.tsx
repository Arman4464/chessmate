"use client"

import { useContext, useState } from "react"
import { AnalyzeContext, players } from "@/context/analyze"
import RatingCount from "./ratingCount"
import PlayersAccuracy, { accuracyPhases } from "./playersAccuracy"
import GameRating from "./gameRating"
import CoachVerdictCard from "./coachVerdictCard"
import EcoOpeningCard from "./ecoOpeningCard"
import { move } from "@/engine/stockfish"
import GameChart from "../gameChart"

export default function Summary(props: {
    moves: move[]
    container: HTMLElement
    players: players
    moveNumber: number
    setMoveNumber: (moveNumber: number) => void
    setAnimation: (animation: boolean) => void
    setForward: (forward: boolean) => void
}) {
    const { moves, container, players, moveNumber, setMoveNumber, setAnimation, setForward } = props

    const analyzeContext = useContext(AnalyzeContext)
    const setTab = analyzeContext.tab[1]
    const [result] = analyzeContext.result

    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })
    const [accuracyPhases, setAccuracyPhases] = useState<accuracyPhases>({
        opening: { w: [], b: [] },
        middlegame: { w: [], b: [] },
        endgame: { w: [], b: [] }
    })

    const opening = analyzeContext.data[0]?.opening

    return (
        <div className="flex flex-col items-center w-full px-3.5 py-3 gap-3.5 select-none overflow-y-auto max-h-full scrollbar-thin">
            {/* Coach Verdict Card with Avatar & Dynamic Speech Bubble */}
            <div className="w-full">
                <CoachVerdictCard
                    players={players}
                    accuracy={accuracy}
                    result={result}
                    moves={moves}
                    opening={opening}
                />
            </div>

            {/* Evaluation Flow Line Chart */}
            <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-3 shadow-md flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black tracking-wider text-neutral-400 uppercase">
                        Evaluation Flow
                    </span>
                    <span className="text-[11px] text-neutral-400 font-semibold">
                        Move Timeline
                    </span>
                </div>
                <div className="w-full flex justify-center py-1">
                    <GameChart
                        setMoveNumber={setMoveNumber}
                        moves={moves}
                        container={container}
                        moveNumber={moveNumber}
                        setAnimation={setAnimation}
                        setForward={setForward}
                    />
                </div>
            </div>

            {/* ECO Opening Card */}
            {opening && (
                <div className="w-full">
                    <EcoOpeningCard
                        code={opening.code}
                        name={opening.name}
                        url={opening.url}
                    />
                </div>
            )}

            {/* Head-to-Head CAPS2 Accuracy Bar */}
            <div className="w-full">
                <PlayersAccuracy
                    setAccuracyPhases={setAccuracyPhases}
                    accuracy={[accuracy, setAccuracy]}
                    players={players}
                    moves={moves}
                />
            </div>

            {/* Estimated Game Rating Cards */}
            <div className="w-full">
                <GameRating
                    players={players}
                    accuracy={accuracy}
                    accuracyPhases={accuracyPhases}
                />
            </div>

            {/* Move Classification Breakdown Table */}
            <div className="w-full">
                <RatingCount moves={moves} />
            </div>

            {/* Big Green Start Review CTA Button */}
            <div className="w-full pt-1 pb-4">
                <button
                    type="button"
                    onClick={() => {
                        setMoveNumber(1)
                        setTab('moves')
                    }}
                    className="w-full py-3.5 bg-[#81b64c] hover:bg-[#8cc352] active:scale-[0.98] text-white font-black text-base rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                    <span>Start Review</span>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}