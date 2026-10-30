"use client"

import React, { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"
import CoachAvatar from "@/components/svg/coachAvatar"
import RatingSVG from "@/components/svg/rating"

export default function RetryTrainer() {
    const analyzeContext = useContext(AnalyzeContext)
    const [retryState] = analyzeContext.retryState
    const [keyMoments] = analyzeContext.keyMoments
    const [keyMomentIndex] = analyzeContext.keyMomentIndex
    const { exitRetry, revealRetrySolution, nextKeyMoment } = analyzeContext

    if (!retryState.active) return null

    const expression = retryState.status === 'success'
        ? 'happy'
        : retryState.status === 'incorrect'
        ? 'concerned'
        : 'analytical'

    const hasNextKeyMoment = keyMoments.length > 0 && keyMomentIndex < keyMoments.length - 1

    return (
        <div className="w-full px-4 pt-3 pb-2 select-none">
            <div className="flex items-start gap-3">
                {/* Coach Portrait Avatar */}
                <div className="flex-shrink-0 pt-1">
                    <CoachAvatar size={48} expression={expression} />
                </div>

                {/* Speech Bubble Card with pointer tail */}
                <div className="relative flex-1 bg-[#262421] text-white p-4 rounded-2xl shadow-2xl border border-white/10 before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-t-[8px] before:border-t-transparent before:border-b-[8px] before:border-b-transparent before:border-r-[10px] before:border-r-[#262421]">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-2.5">
                        <div className="flex items-center gap-2">
                            <RatingSVG draggable rating={retryState.mistakeRating} size={22} />
                            <span className="font-extrabold text-sm md:text-base text-neutral-200">
                                {retryState.status === 'success' ? (
                                    <span className="text-[#81b64c]">Solved!</span>
                                ) : (
                                    <span>Retry Mistake</span>
                                )}
                            </span>
                        </div>
                        {retryState.attempts > 0 && retryState.status !== 'success' && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                                Attempt {retryState.attempts}
                            </span>
                        )}
                    </div>

                    {/* Status Feedback / Prompt */}
                    {retryState.status === 'success' ? (
                        <div className="space-y-2">
                            <div className="p-2.5 bg-[#81b64c]/20 border border-[#81b64c]/40 rounded-xl">
                                <p className="text-sm font-black text-[#81b64c]">
                                    Best Move! You found it!
                                </p>
                                <p className="text-xs text-neutral-200 mt-0.5">
                                    Great tactical vision. You found the winning continuation.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                {hasNextKeyMoment ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            exitRetry()
                                            nextKeyMoment()
                                        }}
                                        className="flex-1 py-2 px-3 bg-[#81b64c] hover:bg-[#8cc352] active:scale-95 text-white font-black text-xs md:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Next Key Moment</span>
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                        </svg>
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={exitRetry}
                                    className={`py-2 px-3 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-bold transition-all ${
                                        hasNextKeyMoment ? 'text-neutral-300' : 'flex-1 bg-[#81b64c] text-white border-transparent'
                                    }`}
                                >
                                    Continue Review
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <p className="text-xs md:text-sm text-neutral-200 leading-relaxed font-medium">
                                {retryState.feedbackMessage || (
                                    <>
                                        You played <span className="font-bold text-white">{retryState.mistakeSan}</span>, which was a <span className="capitalize font-bold text-[#ffa459]">{retryState.mistakeRating}</span>. Can you find the best move?
                                    </>
                                )}
                            </p>

                            {/* Show Solution text if revealed */}
                            {retryState.showSolution && (
                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
                                    <span className="text-xs font-semibold text-neutral-400">Best move was:</span>
                                    <span className="text-sm font-extrabold text-[#81b64c] tracking-wide">
                                        {retryState.targetBestMoveSan}
                                    </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1">
                                {!retryState.showSolution && (
                                    <button
                                        type="button"
                                        onClick={revealRetrySolution}
                                        className="flex-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-300 hover:text-white font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <svg className="w-3.5 h-3.5 fill-current text-yellow-400" viewBox="0 0 24 24">
                                            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
                                        </svg>
                                        <span>Show Solution</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={exitRetry}
                                    className="py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/15 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
