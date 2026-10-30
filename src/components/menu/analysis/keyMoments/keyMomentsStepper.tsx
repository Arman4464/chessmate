"use client"

import React, { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"
import RatingSVG from "@/components/svg/rating"
import { KeyMoment } from "./types"

const RATING_COLORS: Record<string, string> = {
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

export default function KeyMomentsStepper() {
    const analyzeContext = useContext(AnalyzeContext)
    const [keyMoments] = analyzeContext.keyMoments
    const [keyMomentIndex] = analyzeContext.keyMomentIndex
    const [isKeyMomentsMode, setIsKeyMomentsMode] = analyzeContext.isKeyMomentsMode
    const { goToKeyMoment, nextKeyMoment, prevKeyMoment } = analyzeContext

    if (!keyMoments || keyMoments.length === 0) {
        return null
    }

    const currentIndex = keyMomentIndex >= 0 && keyMomentIndex < keyMoments.length ? keyMomentIndex : 0
    const currentMoment: KeyMoment | undefined = keyMoments[currentIndex]
    const ratingColor = currentMoment ? RATING_COLORS[currentMoment.rating] || '#81b64c' : '#81b64c'

    return (
        <div className="w-full px-4 pt-2 pb-1 select-none flex-shrink-0">
            <div className="w-full bg-[#1e1d1a] border border-white/10 rounded-xl p-3 shadow-md flex flex-col gap-2.5">
                {/* Stepper Header Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {currentMoment && (
                            <RatingSVG draggable rating={currentMoment.rating} size={22} />
                        )}
                        <div>
                            <span className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                                Key Moment {currentIndex + 1} of {keyMoments.length}
                            </span>
                            {currentMoment && (
                                <h4
                                    className="text-sm md:text-base font-extrabold leading-tight tracking-tight"
                                    style={{ color: ratingColor }}
                                >
                                    {currentMoment.title}
                                </h4>
                            )}
                        </div>
                    </div>

                    {/* Prev / Next Nav Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={prevKeyMoment}
                            disabled={currentIndex <= 0}
                            className={`p-1.5 rounded-lg border transition-all ${
                                currentIndex <= 0
                                    ? 'border-white/5 text-neutral-600 cursor-not-allowed bg-transparent'
                                    : 'border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 bg-white/5 active:scale-95'
                            }`}
                            aria-label="Previous Key Moment"
                            title="Previous Key Moment"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={nextKeyMoment}
                            disabled={currentIndex >= keyMoments.length - 1}
                            className={`p-1.5 rounded-lg border transition-all ${
                                currentIndex >= keyMoments.length - 1
                                    ? 'border-white/5 text-neutral-600 cursor-not-allowed bg-transparent'
                                    : 'border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 bg-white/5 active:scale-95'
                            }`}
                            aria-label="Next Key Moment"
                            title="Next Key Moment"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Interactive Pills Timeline */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    {keyMoments.map((moment, idx) => {
                        const isSelected = idx === currentIndex
                        const pillColor = RATING_COLORS[moment.rating] || '#81b64c'

                        return (
                            <button
                                key={moment.id}
                                type="button"
                                onClick={() => goToKeyMoment(idx)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 border ${
                                    isSelected
                                        ? 'ring-2 ring-white scale-105 shadow-md border-transparent text-white'
                                        : 'border-white/10 hover:border-white/30 text-neutral-300 bg-white/5 hover:bg-white/10'
                                }`}
                                style={{
                                    backgroundColor: isSelected ? pillColor : undefined,
                                }}
                                title={`${moment.turnColor === 'w' ? 'White' : 'Black'}: ${moment.san} (${moment.title})`}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{
                                        backgroundColor: isSelected ? '#ffffff' : pillColor,
                                    }}
                                />
                                <span className="tabular-nums">
                                    {moment.moveNumber}.{moment.turnColor === 'b' ? '..' : ''}
                                </span>
                                <span className="font-extrabold">{moment.san}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
