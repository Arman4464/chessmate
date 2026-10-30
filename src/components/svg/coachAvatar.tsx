import React from "react"

export interface CoachAvatarProps {
    size?: number
    className?: string
    style?: React.CSSProperties
    expression?: 'happy' | 'neutral' | 'concerned' | 'analytical'
}

export default function CoachAvatar({
    size = 48,
    className = "",
    style = {},
    expression = 'happy',
}: CoachAvatarProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`select-none flex-shrink-0 ${className}`}
            style={style}
            aria-label="Chess.com Coach"
        >
            <defs>
                <clipPath id="coach-circle-clip">
                    <circle cx="50" cy="50" r="47" />
                </clipPath>
                <linearGradient id="coach-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#3d3a36" />
                    <stop offset="100%" stopColor="#262421" />
                </linearGradient>
                <linearGradient id="coach-blazer" x1="20" y1="65" x2="80" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#81b64c" />
                    <stop offset="100%" stopColor="#537e35" />
                </linearGradient>
                <linearGradient id="coach-skin" x1="40" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f7d4b2" />
                    <stop offset="100%" stopColor="#e8b88e" />
                </linearGradient>
                <linearGradient id="coach-glasses" x1="30" y1="36" x2="70" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2c2a27" />
                    <stop offset="100%" stopColor="#1a1917" />
                </linearGradient>
            </defs>

            {/* Outer Ring & Background */}
            <circle cx="50" cy="50" r="49" fill="#81b64c" />
            <circle cx="50" cy="50" r="47" fill="url(#coach-bg)" />

            {/* Clipped Coach Figure */}
            <g clipPath="url(#coach-circle-clip)">
                {/* Shoulders / Green Blazer */}
                <path
                    d="M12 100 C15 78, 25 70, 38 67 L50 78 L62 67 C75 70, 85 78, 88 100 Z"
                    fill="url(#coach-blazer)"
                />

                {/* White Collared Shirt */}
                <polygon points="43,67 50,82 57,67 54,65 50,71 46,65" fill="#f5f5f5" />
                {/* Dark Necktie */}
                <polygon points="48,70 52,70 53,88 50,92 47,88" fill="#262421" />
                {/* Blazer Lapels */}
                <path
                    d="M38 67 L46 86 L50 84 L43 67 Z"
                    fill="#62993e"
                />
                <path
                    d="M62 67 L54 86 L50 84 L57 67 Z"
                    fill="#49702e"
                />

                {/* Neck */}
                <rect x="44" y="54" width="12" height="15" rx="3" fill="#dfad84" />

                {/* Head / Face */}
                <path
                    d="M33 38 C33 24, 40 18, 50 18 C60 18, 67 24, 67 38 C67 52, 60 62, 50 62 C40 62, 33 52, 33 38 Z"
                    fill="url(#coach-skin)"
                />

                {/* Ears */}
                <circle cx="32" cy="40" r="4" fill="#e2a87f" />
                <circle cx="68" cy="40" r="4" fill="#d99f76" />

                {/* Hair */}
                <path
                    d="M32 35 C32 22, 38 14, 50 14 C62 14, 68 20, 68 31 C64 26, 58 24, 50 24 C44 24, 38 27, 32 35 Z"
                    fill="#2b2622"
                />
                <path
                    d="M32 34 C31 29, 34 23, 38 19 C42 16, 54 13, 62 16 C67 18, 68 23, 68 28 C64 22, 56 20, 48 21 C40 22, 35 27, 32 34 Z"
                    fill="#1e1a17"
                />

                {/* Eyebrows */}
                {expression === 'concerned' ? (
                    <>
                        <path d="M37 32 Q42 34 45 31" stroke="#231f1c" strokeWidth="2" strokeLinecap="round" />
                        <path d="M55 31 Q58 34 63 32" stroke="#231f1c" strokeWidth="2" strokeLinecap="round" />
                    </>
                ) : (
                    <>
                        <path d="M37 31 Q41 29 46 31" stroke="#231f1c" strokeWidth="2" strokeLinecap="round" />
                        <path d="M54 31 Q59 29 63 31" stroke="#231f1c" strokeWidth="2" strokeLinecap="round" />
                    </>
                )}

                {/* Eyes */}
                <circle cx="41.5" cy="38" r="2.2" fill="#24211e" />
                <circle cx="58.5" cy="38" r="2.2" fill="#24211e" />
                <circle cx="42.2" cy="37.3" r="0.7" fill="#ffffff" />
                <circle cx="59.2" cy="37.3" r="0.7" fill="#ffffff" />

                {/* Glasses */}
                {/* Left Frame */}
                <rect
                    x="35"
                    y="33"
                    width="13"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="url(#coach-glasses)"
                    strokeWidth="1.8"
                />
                {/* Left Lens Glare */}
                <line x1="37" y1="35" x2="40" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />

                {/* Bridge */}
                <path d="M48 37 Q50 36 52 37" fill="none" stroke="url(#coach-glasses)" strokeWidth="1.8" />

                {/* Right Frame */}
                <rect
                    x="52"
                    y="33"
                    width="13"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="url(#coach-glasses)"
                    strokeWidth="1.8"
                />
                {/* Right Lens Glare */}
                <line x1="54" y1="35" x2="57" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />

                {/* Temples */}
                <line x1="35" y1="36" x2="31" y2="38" stroke="url(#coach-glasses)" strokeWidth="1.4" />
                <line x1="65" y1="36" x2="69" y2="38" stroke="url(#coach-glasses)" strokeWidth="1.4" />

                {/* Nose */}
                <path d="M49 41 L50 45 L48 46" fill="none" stroke="#cf9972" strokeWidth="1.3" strokeLinecap="round" />

                {/* Mouth */}
                {expression === 'happy' ? (
                    <path
                        d="M44 51 Q50 56 56 51"
                        fill="none"
                        stroke="#6b3a2a"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                ) : expression === 'concerned' ? (
                    <path
                        d="M45 53 Q50 49 55 53"
                        fill="none"
                        stroke="#6b3a2a"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                ) : (
                    <line x1="45" y1="51" x2="55" y2="51" stroke="#6b3a2a" strokeWidth="1.8" strokeLinecap="round" />
                )}
            </g>
        </svg>
    )
}

export { CoachAvatar }
