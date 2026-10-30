"use client"

export default function Evaluation(props: {
    size: number
    white: boolean
    advantage: string[]
    whiteMoving: boolean
    navTop?: boolean
}) {
    const { size, white, advantage, whiteMoving } = props

    // Compute evaluation from White's perspective (+ = White advantage, - = Black advantage)
    const rawVal = Number(advantage[1])
    const advantageAmount = (isNaN(rawVal) ? 0 : rawVal) * (whiteMoving ? 1 : -1)

    // Smooth Sigmoidal Logistic Win Expectancy Height Scaling
    // E(cp) = 1 / (1 + 10^(-cp / 400))
    let percent = 50
    if (advantage[0] === 'mate') {
        if (!isNaN(rawVal) && rawVal !== 0) {
            percent = advantageAmount > 0 ? 100 : 0
        } else {
            percent = whiteMoving ? 0 : 100
        }
    } else {
        // Sigmoid mapping clamped between 4% and 96%
        const logisticWinExpectancy = 1 / (1 + Math.pow(10, -advantageAmount / 400))
        const rawPercent = logisticWinExpectancy * 100
        percent = Math.min(Math.max(rawPercent, 4), 96)
    }

    const whiteWinning = advantageAmount > 0
    const absScore = Math.abs(advantageAmount) / 100

    let displayAdvantage = '0.0'
    if (advantage[0] === 'mate') {
        const mateVal = Math.abs(rawVal)
        displayAdvantage = mateVal > 0 ? `M${mateVal}` : (whiteMoving ? '0-1' : '1-0')
    } else {
        displayAdvantage = absScore.toFixed(1)
    }

    // Determine the height of the white bar
    // If board is flipped (white === false), White is at top, Black at bottom
    const whiteBarHeight = white ? percent : (100 - percent)

    // Determine which label is active
    // When white === true (normal): top is Black, bottom is White
    // When white === false (flipped): top is White, bottom is Black
    const topActive = (white ? !whiteWinning : whiteWinning) && absScore > 0
    const bottomActive = (white ? whiteWinning : !whiteWinning) || absScore === 0

    return (
        <div
            style={{ height: size }}
            className="w-7 bg-[#262421] rounded overflow-hidden flex flex-col justify-end relative shadow-inner select-none flex-shrink-0 border border-white/10"
        >
            {/* White evaluation fill */}
            <div
                style={{
                    height: `${whiteBarHeight}%`,
                    transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="w-full bg-white relative"
            />

            {/* Score label anchored cleanly */}
            <div className="absolute inset-0 flex flex-col justify-between items-center py-2 px-0.5 pointer-events-none">
                {/* Top score label: on dark #262421 background -> crisp text-white */}
                <div
                    className={`text-[10px] font-black tracking-tight transition-opacity duration-200 tabular-nums ${
                        topActive ? 'opacity-100 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'opacity-0 text-white'
                    }`}
                >
                    {displayAdvantage}
                </div>

                {/* Bottom score label: on white bar -> dark text-[#262421] */}
                <div
                    className={`text-[10px] font-black tracking-tight transition-opacity duration-200 tabular-nums ${
                        bottomActive ? 'opacity-100 text-[#262421]' : 'opacity-0 text-[#262421]'
                    }`}
                >
                    {displayAdvantage}
                </div>
            </div>
        </div>
    )
}