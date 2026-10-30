const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// 1. Update src/components/game/game.tsx to render GameButtons beneath the board
const gamePath = path.join(root, 'src', 'components', 'game', 'game.tsx');
let gameContent = fs.readFileSync(gamePath, 'utf8');

const targetPlayerCard = `                {/* Bottom Player (Self) */}
                <div style={{ width: boardWidthWithEval }} className="flex flex-row justify-between items-center">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'black' : 'white']} white={white}>{\`\${players[white ? 0 : 1].name} \${players[white ? 0 : 1].elo !== 'NOELO' ? \`(\${players[white ? 0 : 1].elo})\` : ''}\`}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>`;

const normalizedGame = gameContent.replace(/\r\n/g, '\n');
const normalizedTarget = targetPlayerCard.replace(/\r\n/g, '\n');

if (normalizedGame.includes(normalizedTarget)) {
    const replacementPlayerCard = `${targetPlayerCard}

                {/* Tactical Stepper Navigation Bar */}
                <div style={{ width: boardWidthWithEval }} className="rounded-xl overflow-hidden shadow-lg border border-white/10 bg-[#262421]">
                    <GameButtons />
                </div>`.replace(/\r\n/g, '\n');

    const updatedGame = normalizedGame.replace(normalizedTarget, replacementPlayerCard);
    fs.writeFileSync(gamePath, updatedGame.replace(/\n/g, '\r\n'), 'utf8');
    console.log('[UI Overhaul] Successfully mounted GameButtons into game.tsx');
} else {
    console.warn('[UI Overhaul] Warning: Target not matched in game.tsx');
}

// 2. Update src/components/menu/analysis/moves/moves.tsx to include GameButtons at the bottom of the moves pane as well
const movesPath = path.join(root, 'src', 'components', 'menu', 'analysis', 'moves', 'moves.tsx');
let movesContent = fs.readFileSync(movesPath, 'utf8');
const normalizedMoves = movesContent.replace(/\r\n/g, '\n');

if (!normalizedMoves.includes('import GameButtons')) {
    const importTarget = `import RatingSVG from "@/components/svg/rating"`;
    const importReplacement = `import RatingSVG from "@/components/svg/rating"\nimport GameButtons from "../gameButtons"`;
    movesContent = movesContent.replace(importTarget, importReplacement);
}

const chartTarget = `            {/* Bottom Evaluation Chart */}
            <div className="flex-shrink-0 w-full px-4 pt-1 pb-2 border-t border-white/5 flex justify-center">
                <GameChart
                    container={container}
                    moves={moves}
                    moveNumber={moveNumber}
                    setMoveNumber={setMoveNumber}
                    setAnimation={setAnimation}
                    setForward={setForward}
                />
            </div>`.replace(/\r\n/g, '\n');

const chartReplacement = `            {/* Bottom Evaluation Chart */}
            <div className="flex-shrink-0 w-full px-4 pt-1 pb-1 border-t border-white/5 flex justify-center">
                <GameChart
                    container={container}
                    moves={moves}
                    moveNumber={moveNumber}
                    setMoveNumber={setMoveNumber}
                    setAnimation={setAnimation}
                    setForward={setForward}
                />
            </div>

            {/* Stepper Controls in Sidebar */}
            <div className="flex-shrink-0 w-full border-t border-white/10 bg-[#211f1c]">
                <GameButtons />
            </div>`.replace(/\r\n/g, '\n');

const normalizedMovesAfterImport = movesContent.replace(/\r\n/g, '\n');
if (normalizedMovesAfterImport.includes(chartTarget)) {
    const updatedMoves = normalizedMovesAfterImport.replace(chartTarget, chartReplacement);
    fs.writeFileSync(movesPath, updatedMoves.replace(/\n/g, '\r\n'), 'utf8');
    console.log('[UI Overhaul] Successfully mounted GameButtons into moves.tsx');
} else {
    console.warn('[UI Overhaul] Warning: Chart target not matched in moves.tsx');
}

// 3. Polish src/components/game/name.tsx (rounded avatar, badge styling)
const namePath = path.join(root, 'src', 'components', 'game', 'name.tsx');
let nameContent = fs.readFileSync(namePath, 'utf8');
nameContent = nameContent.replace(
    'className={`w-9 h-9 overflow-hidden flex items-end justify-center flex-shrink-0 shadow-sm ${',
    'className={`w-9 h-9 rounded-lg overflow-hidden flex items-end justify-center flex-shrink-0 shadow-md ring-1 ring-white/10 ${'
);
fs.writeFileSync(namePath, nameContent, 'utf8');
console.log('[UI Overhaul] Polished player avatar in name.tsx');

// 4. Polish src/components/game/clock.tsx (rounded-lg, glow)
const clockPath = path.join(root, 'src', 'components', 'game', 'clock.tsx');
let clockContent = fs.readFileSync(clockPath, 'utf8');
clockContent = clockContent.replace(
    "className={`flex items-center gap-2 px-3 py-1.5 font-mono font-bold text-sm md:text-base select-none transition-all duration-150 ${",
    "className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono font-bold text-sm md:text-base select-none shadow-md transition-all duration-150 ${\n"
);
fs.writeFileSync(clockPath, clockContent, 'utf8');
console.log('[UI Overhaul] Polished clock component in clock.tsx');

// 5. Polish src/components/menu/analyze/form.tsx (rounded inputs, modern Chess.com buttons)
const formPath = path.join(root, 'src', 'components', 'menu', 'analyze', 'form.tsx');
let formContent = fs.readFileSync(formPath, 'utf8');
formContent = formContent.replace(
    'className="w-full px-3.5 py-3 text-sm md:text-base font-semibold border border-white/10 bg-[#1e1d1a] text-white placeholder-neutral-500 focus:outline-none focus:border-[#81b64c] transition-colors resize-none shadow-inner"',
    'className="w-full px-4 py-3.5 text-sm md:text-base font-semibold rounded-xl border border-white/15 bg-[#1e1d1a] text-white placeholder-neutral-500 focus:outline-none focus:border-[#81b64c] focus:ring-2 focus:ring-[#81b64c]/30 transition-all resize-none shadow-inner"'
);
formContent = formContent.replace(
    'className="w-full h-12 px-4 bg-[#1e1d1a] hover:bg-white/5 border border-white/10 text-white font-bold text-sm md:text-base flex items-center justify-between transition-colors shadow-sm"',
    'className="w-full h-12 px-4 bg-[#1e1d1a] hover:bg-white/5 border border-white/15 rounded-xl text-white font-bold text-sm md:text-base flex items-center justify-between transition-all shadow-sm"'
);
formContent = formContent.replace(
    'className="flex flex-col gap-3 p-3 bg-black/25 border border-white/5 mt-1 animate-fadeIn"',
    'className="flex flex-col gap-3 p-3.5 bg-black/30 border border-white/10 rounded-xl mt-1.5 shadow-lg animate-fadeIn"'
);
formContent = formContent.replace(
    'className="w-full h-14 mt-2 bg-[#81b64c] hover:bg-[#8cc352] active:scale-[0.98] text-white font-black text-lg shadow-lg transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-50"',
    'className="w-full h-14 mt-2 bg-[#81b64c] hover:bg-[#8cc352] active:scale-[0.98] text-white font-black text-lg rounded-xl shadow-xl transition-all flex items-center justify-center cursor-pointer select-none disabled:opacity-50 hover:shadow-[0_0_20px_rgba(129,182,76,0.35)]"'
);
fs.writeFileSync(formPath, formContent, 'utf8');
console.log('[UI Overhaul] Polished input form in form.tsx');
