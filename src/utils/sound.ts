import { Howl } from 'howler'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

// Cached Howl audio instances
let moveSelfSound: Howl | null = null
let moveOpponentSound: Howl | null = null
let moveCheckSound: Howl | null = null
let captureSound: Howl | null = null
let castleSound: Howl | null = null
let gameEndSound: Howl | null = null
let gameStartSound: Howl | null = null
let illegalSound: Howl | null = null
let promoteSound: Howl | null = null

function getHowl(src: string, volume = 1.0): Howl {
    return new Howl({
        src: [`${basePath}${src}`],
        preload: true,
        volume,
    })
}

function initHowlSounds() {
    if (typeof window === 'undefined') return
    if (!moveSelfSound) {
        moveSelfSound = getHowl('/sounds/move-self.mp3')
        moveOpponentSound = getHowl('/sounds/move-opponent.mp3')
        moveCheckSound = getHowl('/sounds/move-check.mp3')
        captureSound = getHowl('/sounds/capture.mp3')
        castleSound = getHowl('/sounds/castle.mp3')
        gameEndSound = getHowl('/sounds/game-end.mp3', 0.4)
        gameStartSound = getHowl('/sounds/game-start.mp3', 0.5)
        illegalSound = getHowl('/sounds/illegal.mp3', 0.5)
        promoteSound = getHowl('/sounds/promote.mp3')
    }
}

// Global AudioContext singleton for synthesized fanfares
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioContextClass) {
            audioCtx = new AudioContextClass()
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {})
    }
    return audioCtx
}

/**
 * Synthesizes the iconic Chess.com Brilliant Move (!!) celebratory fanfare / chime.
 * Uses a crystalline major arpeggio (C5 -> E5 -> G5 -> C6 -> E6) with harmonic overtones
 * and exponential sparkle decay for zero-dependency authentic audio playback.
 */
export function playBrilliantFanfare() {
    try {
        const ctx = getAudioContext()
        if (!ctx) return

        const now = ctx.currentTime

        // Master gain & compressor to prevent clipping
        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.setValueAtTime(-18, now)
        compressor.knee.setValueAtTime(12, now)
        compressor.ratio.setValueAtTime(6, now)
        compressor.attack.setValueAtTime(0.003, now)
        compressor.release.setValueAtTime(0.25, now)

        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.35, now)
        masterGain.connect(compressor)
        compressor.connect(ctx.destination)

        // Brilliant fanfare chords/arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50), E6 (1318.51)
        const notes = [
            { freq: 523.25, time: 0.00, dur: 0.45, gain: 0.22 },
            { freq: 659.25, time: 0.07, dur: 0.45, gain: 0.25 },
            { freq: 783.99, time: 0.14, dur: 0.50, gain: 0.28 },
            { freq: 1046.50, time: 0.22, dur: 0.70, gain: 0.35 },
            { freq: 1318.51, time: 0.30, dur: 0.95, gain: 0.40 },
        ]

        notes.forEach(({ freq, time, dur, gain: noteGainVal }) => {
            const start = now + time

            // Fundamental tone (pure sine for bell chime)
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, start)

            // Sparkle overtone (octave + fifth harmonic)
            const sparkle = ctx.createOscillator()
            sparkle.type = 'triangle'
            sparkle.frequency.setValueAtTime(freq * 2, start)

            const noteGain = ctx.createGain()
            noteGain.gain.setValueAtTime(0.001, start)
            noteGain.gain.exponentialRampToValueAtTime(noteGainVal, start + 0.015)
            noteGain.gain.exponentialRampToValueAtTime(noteGainVal * 0.4, start + 0.1)
            noteGain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

            const sparkleGain = ctx.createGain()
            sparkleGain.gain.setValueAtTime(0.001, start)
            sparkleGain.gain.exponentialRampToValueAtTime(noteGainVal * 0.25, start + 0.01)
            sparkleGain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.6)

            osc.connect(noteGain)
            sparkle.connect(sparkleGain)

            noteGain.connect(masterGain)
            sparkleGain.connect(masterGain)

            osc.start(start)
            sparkle.start(start)

            osc.stop(start + dur + 0.05)
            sparkle.stop(start + dur + 0.05)
        })
    } catch {
        // Fallback gracefully if Web Audio is unavailable
    }
}

/**
 * Synthesizes an energetic, uplifting 2-note chime when finding the correct move in Retry mode.
 */
export function playRetrySuccessSound() {
    try {
        const ctx = getAudioContext()
        if (!ctx) return

        const now = ctx.currentTime
        const masterGain = ctx.createGain()
        masterGain.gain.setValueAtTime(0.3, now)
        masterGain.connect(ctx.destination)

        const notes = [
            { freq: 783.99, time: 0.0, dur: 0.25 }, // G5
            { freq: 1046.50, time: 0.1, dur: 0.45 }, // C6
        ]

        notes.forEach(({ freq, time, dur }) => {
            const start = now + time
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, start)

            const noteGain = ctx.createGain()
            noteGain.gain.setValueAtTime(0.001, start)
            noteGain.gain.exponentialRampToValueAtTime(0.3, start + 0.01)
            noteGain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

            osc.connect(noteGain)
            noteGain.connect(masterGain)

            osc.start(start)
            osc.stop(start + dur + 0.05)
        })
    } catch {
        // Web Audio fallback
    }
}

export function playRetryFailSound() {
    initHowlSounds()
    if (illegalSound) {
        illegalSound.play()
    } else {
        // Soft audio thud via Web Audio API if asset not ready
        try {
            const ctx = getAudioContext()
            if (!ctx) return
            const now = ctx.currentTime
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(140, now)
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.15)
            gain.gain.setValueAtTime(0.25, now)
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + 0.16)
        } catch {}
    }
}

export const playIllegalSound = playRetryFailSound

export function playMoveSound(selfTurn: boolean) {
    initHowlSounds()
    if (selfTurn) {
        moveSelfSound?.play()
    } else {
        moveOpponentSound?.play()
    }
}

export function playCaptureSound() {
    initHowlSounds()
    captureSound?.play()
}

export function playCastleSound() {
    initHowlSounds()
    castleSound?.play()
}

export function playCheckSound() {
    initHowlSounds()
    moveCheckSound?.play()
}

export function playPromoteSound() {
    initHowlSounds()
    promoteSound?.play()
}

export function playGameEndSound() {
    initHowlSounds()
    gameEndSound?.play()
}

export function playGameStartSound() {
    initHowlSounds()
    gameStartSound?.play()
}
