"use client"

import { move, moveRating } from "@/engine/stockfish"
import { useEffect, useState } from "react"
import { getLastBookMove } from "./moves/moves"

const BADGE_CONFIG: Record<string, { fill: string; glyph: string; title: string }> = {
    blunder: { fill: '#fa412d', glyph: '??', title: 'Blunder' },
    mistake: { fill: '#ffa459', glyph: '?', title: 'Mistake' },
    miss: { fill: '#ff7769', glyph: 'X', title: 'Miss' },
    brilliant: { fill: '#26c2a3', glyph: '!!', title: 'Brilliant' },
    great: { fill: '#5c8bb0', glyph: '!', title: 'Great' },
    best: { fill: '#81b64c', glyph: '★', title: 'Best' },
    inaccuracy: { fill: '#f7c631', glyph: '!?', title: 'Inaccuracy' },
    book: { fill: '#d5a47d', glyph: '📖', title: 'Book' },
}

function isImportantMove(
    moveNumber: number,
    rating: moveRating | undefined,
    prevRating: moveRating | undefined,
    _nextRating: moveRating | undefined,
    lastBookMove: number
): string | undefined {
    if (!rating) return

    if (moveNumber === lastBookMove) return 'book'
    if (rating === 'best' && prevRating === 'inaccuracy') return 'best'
    if (rating === 'blunder') return 'blunder'
    if (rating === 'mistake') return 'mistake'
    if (rating === 'miss') return 'miss'
    if (rating === 'great') return 'great'
    if (rating === 'brilliant') return 'brilliant'

    return
}

function formatChartEval(evaluation?: string[]): string {
    if (!evaluation || !evaluation[1]) return '0.00'
    if (evaluation[0] === 'mate') {
        const moves = Math.abs(Number(evaluation[1]))
        return Number(evaluation[1]) >= 0 ? `+M${moves}` : `-M${moves}`
    }
    const cp = Number(evaluation[1]) / 100
    return `${cp > 0 ? '+' : ''}${cp.toFixed(2)}`
}

export default function GameChart(props: {
    moves: move[]
    container: HTMLElement
    moveNumber: number
    setMoveNumber: (moveNumber: number) => void
    setAnimation: (animation: boolean) => void
    setForward: (forward: boolean) => void
}) {
    const { moves, container, moveNumber, setMoveNumber, setAnimation, setForward } = props

    const [hoveredMove, setHoveredMove] = useState(NaN)
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null)
    const [importantMoves, setImportantMoves] = useState<{ ratingKey: string | undefined; move: move; ply: number }[]>([])
    const [size, setSize] = useState({ width: 400, height: 96 })

    const totalMoves = Math.max(1, moves.length - 1)
    const hoveredMoveX = getMoveX(hoveredMove, totalMoves) * size.width
    const moveNumberX = getMoveX(moveNumber, totalMoves) * size.width

    useEffect(() => {
        function setRealSize() {
            if (container) {
                setSize({ width: container.offsetWidth * 0.88, height: 96 })
            }
        }

        setRealSize()
        window.addEventListener('resize', setRealSize)
        return () => window.removeEventListener('resize', setRealSize)
    }, [container])

    const lastBookMove = getLastBookMove(moves)

    useEffect(() => {
        const newImportantMoves = moves.map((m, i) => {
            const rating = m.moveRating
            const previousRating = moves[i - 1]?.moveRating
            const nextRating = moves[i + 1]?.moveRating
            const ratingKey = isImportantMove(i, rating, previousRating, nextRating, lastBookMove)

            return { ratingKey, move: m, ply: i }
        })

        setImportantMoves(newImportantMoves)
    }, [moves, lastBookMove])

    function hoverMove(e: React.MouseEvent) {
        const svg = e.currentTarget as SVGSVGElement
        const rect = svg.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const moveSize = size.width / totalMoves
        const moveIndex = Math.min(totalMoves, Math.max(0, Math.round(mouseX / moveSize)))

        setHoveredMove(moveIndex)
    }

    function changeMoveNumber() {
        if (isNaN(hoveredMove) || hoveredMove === moveNumber) return

        if (Math.abs(moveNumber - hoveredMove) === 1) {
            setAnimation(true)
        }
        if (hoveredMove > moveNumber) {
            setForward(true)
        } else {
            setForward(false)
        }
        setMoveNumber(hoveredMove)
    }

    function getMoveY(m: move, currentMoveNumber: number) {
        const OLD_PERCENTS = [-400, 400]
        const NEW_PERCENTS = [0.075, 0.925]

        const advantage = m.previousStaticEvals?.[0] ?? ['cp', "0"]
        const whiteMoving = currentMoveNumber % 2 === 0
        const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1)

        const rawPercent = ((advantageAmount - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
        let percent
        if (advantage[0] === 'mate') {
            if (advantage[1]) {
                percent = advantageAmount >= 0 ? 1 : 0
            } else {
                percent = whiteMoving ? 0 : 1
            }
        } else {
            percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])
        }

        return percent
    }

    function getMoveX(currentMoveNumber: number, maxNumber: number) {
        return currentMoveNumber / maxNumber
    }

    const currentMoveRating = moves[moveNumber]?.moveRating
    const strokeColor = currentMoveRating && BADGE_CONFIG[currentMoveRating]
        ? BADGE_CONFIG[currentMoveRating].fill
        : '#81b64c'

    // Compute tooltip details for hovered marker
    const activeTooltipMove = hoveredMarker !== null ? moves[hoveredMarker] : null
    const activeTooltipBadge = activeTooltipMove?.moveRating ? BADGE_CONFIG[activeTooltipMove.moveRating] : null

    return (
        <div className="relative inline-block select-none">
            <svg
                onClick={changeMoveNumber}
                onMouseMove={hoverMove}
                onMouseLeave={() => {
                    setHoveredMove(NaN)
                    setHoveredMarker(null)
                }}
                width={size.width}
                height={size.height}
                className="bg-[#1e1d1a] border border-white/10 rounded-xl cursor-pointer overflow-visible"
            >
                {/* Area fill for White advantage */}
                <path
                    fill="#ffffff"
                    fillOpacity="0.9"
                    d={`M 0 ${size.height * 0.5} ${moves
                        .map((m, idx) => {
                            const x = size.width * getMoveX(idx, totalMoves)
                            const y = size.height * (1 - getMoveY(m, idx))
                            return `L ${x} ${y}`
                        })
                        .join(" ")} L ${size.width} ${size.height} L 0 ${size.height}`}
                />

                {/* Center equilibrium zero line */}
                <line
                    x1={0}
                    y1={size.height / 2}
                    x2={size.width}
                    y2={size.height / 2}
                    stroke="#ffffff"
                    strokeOpacity="0.2"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                />

                {/* Hover cursor guide line */}
                {!isNaN(hoveredMoveX) && (
                    <line
                        x1={hoveredMoveX}
                        y1={0}
                        x2={hoveredMoveX}
                        y2={size.height}
                        stroke="#ffffff"
                        strokeOpacity="0.35"
                        strokeWidth={1.5}
                    />
                )}

                {/* Current move vertical indicator line */}
                {!isNaN(moveNumberX) && moveNumber > 0 && (
                    <line
                        x1={moveNumberX}
                        y1={0}
                        x2={moveNumberX}
                        y2={size.height}
                        stroke={strokeColor}
                        strokeWidth={3}
                    />
                )}

                {/* Key Move Classification Icon Markers */}
                {importantMoves.map(({ ratingKey, move: m, ply }) => {
                    if (!ratingKey) return null

                    const badge = BADGE_CONFIG[ratingKey]
                    if (!badge) return null

                    const xRelation = getMoveX(ply, totalMoves)
                    const yRelation = 1 - getMoveY(m, ply)
                    const x = size.width * xRelation
                    const y = size.height * yRelation

                    const isCurrent = ply === moveNumber
                    const isHovered = ply === hoveredMarker

                    return (
                        <g
                            key={ply}
                            className="cursor-pointer transition-transform"
                            onClick={(e) => {
                                e.stopPropagation()
                                setMoveNumber(ply)
                            }}
                            onMouseEnter={() => setHoveredMarker(ply)}
                            onMouseLeave={() => setHoveredMarker(null)}
                        >
                            {/* Glowing halo when selected */}
                            {isCurrent && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={11}
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    opacity={0.9}
                                />
                            )}

                            {/* Crisp circular badge glyph marker */}
                            <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 8.5 : 7}
                                fill={badge.fill}
                                stroke="#1e1d1a"
                                strokeWidth={1.2}
                            />

                            {/* Glyph text inside badge (??, ?, X, !!, !, ★) */}
                            <text
                                x={x}
                                y={y + 0.5}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#ffffff"
                                fontSize={badge.glyph.length > 1 ? "6.5px" : "8px"}
                                fontWeight="900"
                                fontFamily="system-ui, -apple-system, sans-serif"
                                className="select-none pointer-events-none"
                            >
                                {badge.glyph}
                            </text>
                        </g>
                    )
                })}

                {/* Interactive Tooltip rendered on top inside SVG */}
                {hoveredMarker !== null && activeTooltipMove && activeTooltipBadge && (
                    (() => {
                        const xPos = size.width * getMoveX(hoveredMarker, totalMoves)
                        const yPos = size.height * (1 - getMoveY(activeTooltipMove, hoveredMarker))

                        // Keep tooltip within bounds
                        const tooltipWidth = 105
                        const tooltipHeight = 32
                        const tooltipX = xPos + tooltipWidth > size.width ? xPos - tooltipWidth - 6 : xPos + 8
                        const tooltipY = yPos - tooltipHeight < 4 ? yPos + 10 : yPos - tooltipHeight - 4

                        const moveTurn = Math.ceil(hoveredMarker / 2)
                        const isWhite = activeTooltipMove.color === 'w' || hoveredMarker % 2 === 1
                        const moveNotation = `${moveTurn}.${isWhite ? '' : '..'}${activeTooltipMove.san || ''}`
                        const evalText = formatChartEval(activeTooltipMove.evaluation)

                        return (
                            <g className="pointer-events-none select-none drop-shadow-lg">
                                <rect
                                    x={tooltipX}
                                    y={tooltipY}
                                    width={tooltipWidth}
                                    height={tooltipHeight}
                                    rx={6}
                                    fill="#262421"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth={1}
                                />
                                <text
                                    x={tooltipX + 8}
                                    y={tooltipY + 13}
                                    fill={activeTooltipBadge.fill}
                                    fontSize="10px"
                                    fontWeight="bold"
                                >
                                    {activeTooltipBadge.title} ({activeTooltipBadge.glyph})
                                </text>
                                <text
                                    x={tooltipX + 8}
                                    y={tooltipY + 25}
                                    fill="#e0e0e0"
                                    fontSize="9px"
                                    fontWeight="500"
                                >
                                    {moveNotation} • {evalText}
                                </text>
                            </g>
                        )
                    })()
                )}
            </svg>
        </div>
    )
}