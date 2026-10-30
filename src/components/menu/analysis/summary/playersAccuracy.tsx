"use client"

import { players, AnalyzeContext } from "@/context/analyze";
import Profile from "../../../svg/profile";
import { move, position } from "@/engine/stockfish";
import { Dispatch, SetStateAction, useEffect, useContext } from "react";
import { Chess, Color } from "chess.js";

export interface accuracyPhases {
    opening: { w: number[], b: number[] },
    middlegame: { w: number[], b: number[] },
    endgame: { w: number[], b: number[] }
}

function isEndOpening(position: position) {
    let nonDeveloppedBlack = 0, nonDeveloppedWhite = 0
    for (const square of position[0]) {
        if (square?.color === 'w') continue
        if (square?.type === 'n' || square?.type === 'b' || square?.type === 'q') nonDeveloppedBlack++
    }
    for (const square of position[position.length - 1]) {
        if (square?.color === 'b') continue
        if (square?.type === 'n' || square?.type === 'b' || square?.type === 'q') nonDeveloppedWhite++
    }

    const developpedBlack = 5 - nonDeveloppedBlack
    const developpedWhite = 5 - nonDeveloppedWhite

    if (developpedBlack >= 3 && developpedWhite >= 2) return true
    if (developpedWhite >= 3 && developpedBlack >= 2) return true
    if (developpedBlack >= 4) return true
    if (developpedWhite >= 4) return true
}

function isEndMiddlegame(position: position) {
    let whitePieces = 0, blackPieces = 0
    for (const row of position) {
        for (const square of row) {
            if (square?.type === 'r' || square?.type === 'n' || square?.type === 'b' || square?.type === 'q') {
                if (square.color === 'w') whitePieces++
                else blackPieces++
            }
        }
    }

    if (whitePieces <= 2 && blackPieces <= 2) return true
    if (whitePieces <= 1 || blackPieces <= 1) return true
}

/**
 * Calibrated CAPS2 Harmonic Power-Mean Blend (p = 0.25)
 * Combines 50% power-mean (p = 0.25) and 50% arithmetic mean
 * reflecting Chess.com's human accuracy distribution.
 */
export function avg(arr: number[]) {
    if (arr.length === 0) return 100
    const p = 0.25
    const sumP = arr.reduce((acc, cur) => acc + Math.pow(Math.max(cur, 0.5), p), 0)
    const powerMeanVal = Math.pow(sumP / arr.length, 1 / p)
    const arithMeanVal = arr.reduce((acc, cur) => acc + cur, 0) / arr.length
    return 0.50 * powerMeanVal + 0.50 * arithMeanVal
}

function pushAccuracyPhase(arr: accuracyPhases, value: number, phase: 'opening'|'middlegame'|'endgame', color: Color) {
    arr[phase][color].push(value)
}

export default function PlayersAccuracy(props: {
    reducedSummary?: boolean
    players: players
    moves: move[]
    accuracy: [{ w: number, b: number }, Dispatch<SetStateAction<{ w: number, b: number }>>]
    setAccuracyPhases: Dispatch<SetStateAction<accuracyPhases>>
}) {
    const { players, setAccuracyPhases, moves } = props
    const [accuracy, setAccuracy] = props.accuracy

    const analyzeContext = useContext(AnalyzeContext)
    const [gameResult] = analyzeContext.result
    const isWhiteWinner = gameResult === '1-0'
    const isBlackWinner = gameResult === '0-1'

    useEffect(() => {
        const accuracies: { w: number[], b: number[] } = { w: [], b: [] }
        const accuraciesPhases: accuracyPhases = { opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } }

        let currentPhase: 'opening'|'middlegame'|'endgame' = 'opening'
        for (const move of moves) {
            if (!move.moveRating) continue
            if (move.moveRating === 'forced') continue

            const board = new Chess(move.fen).board()
            const playerColor = move.playedBy || (move.color === 'w' ? 'b' : 'w')
            const rating = move.moveRating

            let moveAccuracy: number = move.accuracy ?? NaN
            if (isNaN(moveAccuracy)) {
                switch (rating) {
                    case 'brilliant': case 'great': case 'best': case 'book':
                        moveAccuracy = 100
                        break
                    case 'excellent':
                        moveAccuracy = 93
                        break
                    case 'good':
                        moveAccuracy = 82
                        break
                    case 'inaccuracy':
                        moveAccuracy = 60
                        break
                    case 'mistake':
                        moveAccuracy = 35
                        break
                    case 'miss':
                        moveAccuracy = 25
                        break
                    case 'blunder':
                        moveAccuracy = 10
                        break
                    default:
                        moveAccuracy = 75
                }
            }

            accuracies[playerColor].push(moveAccuracy)

            switch (currentPhase) {
                case 'opening':
                    pushAccuracyPhase(accuraciesPhases, moveAccuracy, 'opening', playerColor)
                    if (isEndOpening(board)) currentPhase = 'middlegame'
                    break
                case 'middlegame':
                    pushAccuracyPhase(accuraciesPhases, moveAccuracy, 'middlegame', playerColor)
                    if (isEndMiddlegame(board)) currentPhase = 'endgame'
                    break
                case 'endgame':
                    pushAccuracyPhase(accuraciesPhases, moveAccuracy, 'endgame', playerColor)
                    break
            }
        }
        const avgW = players[0]?.accuracy !== undefined 
            ? players[0].accuracy 
            : (accuracies.w.length > 0 ? avg(accuracies.w) : 100)
        const avgB = players[1]?.accuracy !== undefined 
            ? players[1].accuracy 
            : (accuracies.b.length > 0 ? avg(accuracies.b) : 100)
        const newAccuracy = { w: avgW, b: avgB }

        setAccuracy(newAccuracy)
        setAccuracyPhases(accuraciesPhases)
    }, [moves, players])

    // Calculate dual comparative split percentage for the comparative bar
    const wVal = isNaN(accuracy.w) ? 50 : Math.max(1, accuracy.w)
    const bVal = isNaN(accuracy.b) ? 50 : Math.max(1, accuracy.b)
    const totalAcc = wVal + bVal
    const whiteComparativeRatio = Math.round((wVal / totalAcc) * 100)
    const blackComparativeRatio = 100 - whiteComparativeRatio

    return (
        <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-4 shadow-md flex flex-col gap-3.5 select-none">
            {/* Header: Section Title */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-wider text-neutral-400 uppercase">
                    CAPS2 Accuracy
                </span>
                <span className="text-[11px] text-neutral-400 font-semibold">
                    Head-to-Head
                </span>
            </div>

            {/* Players Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 items-center">
                {/* White Player Card */}
                <div className="flex items-center gap-3 bg-[#312e2b] rounded-xl p-2.5 border border-white/5 relative">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#dbd9d6] flex items-end justify-center shadow-md border-2 border-white/20 flex-shrink-0">
                        <Profile width={42} height={42} class="fill-white" />
                        {isWhiteWinner && (
                            <span className="absolute -top-1 -right-1 bg-[#e6912c] text-white p-1 rounded-full shadow-lg" title="Winner">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                                </svg>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20 flex-shrink-0" />
                            <span className="font-extrabold text-white text-xs truncate" title={players[0]?.name}>
                                {players[0]?.name || 'White'}
                            </span>
                        </div>
                        {players[0]?.elo && (
                            <span className="text-[10px] text-neutral-400 font-semibold pl-4">
                                ({players[0].elo})
                            </span>
                        )}
                        <span className="text-lg md:text-xl font-black text-white tabular-nums pl-4 leading-tight mt-0.5">
                            {isNaN(accuracy.w) ? '—' : `${accuracy.w.toFixed(1)}%`}
                        </span>
                    </div>
                </div>

                {/* Black Player Card */}
                <div className="flex items-center gap-3 bg-[#312e2b] rounded-xl p-2.5 border border-white/5 relative">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#45423e] flex items-end justify-center shadow-md border-2 border-white/20 flex-shrink-0">
                        <Profile width={42} height={42} class="fill-[#211f1c]" />
                        {isBlackWinner && (
                            <span className="absolute -top-1 -right-1 bg-[#e6912c] text-white p-1 rounded-full shadow-lg" title="Winner">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                                </svg>
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 border border-white/30 flex-shrink-0" />
                            <span className="font-extrabold text-white text-xs truncate" title={players[1]?.name}>
                                {players[1]?.name || 'Black'}
                            </span>
                        </div>
                        {players[1]?.elo && (
                            <span className="text-[10px] text-neutral-400 font-semibold pl-4">
                                ({players[1].elo})
                            </span>
                        )}
                        <span className="text-lg md:text-xl font-black text-white tabular-nums pl-4 leading-tight mt-0.5">
                            {isNaN(accuracy.b) ? '—' : `${accuracy.b.toFixed(1)}%`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Dual Horizontal Comparative Accuracy Bar */}
            <div className="flex flex-col gap-1 pt-0.5">
                <div className="w-full h-3.5 bg-[#1e1d1a] rounded-full overflow-hidden flex border border-white/10 shadow-inner relative">
                    {/* White Fill */}
                    <div
                        style={{ width: `${whiteComparativeRatio}%` }}
                        className="h-full bg-gradient-to-r from-[#f0f0f0] to-white transition-all duration-700 ease-out flex items-center justify-start pl-2"
                    >
                        {whiteComparativeRatio >= 20 && (
                            <span className="text-[9px] font-black text-[#262421] tabular-nums leading-none">
                                {whiteComparativeRatio}%
                            </span>
                        )}
                    </div>

                    {/* Black Fill */}
                    <div
                        style={{ width: `${blackComparativeRatio}%` }}
                        className="h-full bg-gradient-to-r from-[#3f3c37] to-[#262421] transition-all duration-700 ease-out flex items-center justify-end pr-2"
                    >
                        {blackComparativeRatio >= 20 && (
                            <span className="text-[9px] font-black text-neutral-200 tabular-nums leading-none">
                                {blackComparativeRatio}%
                            </span>
                        )}
                    </div>

                    {/* Center 50% Marker Notch */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -ml-[1px] bg-neutral-500/40 pointer-events-none" />
                </div>

                <div className="flex justify-between items-center text-[10px] text-neutral-400 font-semibold px-1">
                    <span>{players[0]?.name || 'White'} ({accuracy.w ? `${accuracy.w.toFixed(0)}%` : '—'})</span>
                    <span>{players[1]?.name || 'Black'} ({accuracy.b ? `${accuracy.b.toFixed(0)}%` : '—'})</span>
                </div>
            </div>
        </div>
    )
}