"use client"

import React from "react"

export interface EcoOpeningCardProps {
    code?: string
    name?: string
    url?: string
}

export default function EcoOpeningCard({ code, name, url }: EcoOpeningCardProps) {
    if (!code && !name) return null

    return (
        <div className="w-full bg-[#262421] border border-white/10 rounded-xl p-3 shadow-md flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-3 min-w-0">
                {/* Book Icon Badge */}
                <div className="w-9 h-9 rounded-lg bg-[#d5a47d]/15 border border-[#d5a47d]/30 flex items-center justify-center shrink-0 shadow-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d5a47d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                </div>

                {/* Details Column */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {code && (
                            <span className="rounded-full bg-[#81b64c]/20 text-[#81b64c] border border-[#81b64c]/30 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
                                {code}
                            </span>
                        )}
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Opening Theory
                        </span>
                    </div>
                    <span className="font-extrabold text-white text-xs md:text-sm truncate" title={name || 'Opening'}>
                        {name || 'Standard Chess Opening'}
                    </span>
                </div>
            </div>

            {/* Explorer indicator */}
            <div className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors shrink-0 text-xs font-semibold cursor-default">
                <span className="hidden sm:inline text-[11px] text-neutral-400">Book</span>
                <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    )
}
