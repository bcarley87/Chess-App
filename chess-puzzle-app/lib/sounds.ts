let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

// Filtered white-noise burst — gives the woody "thock" of a piece on a board
function woodClick(
  freq: number,
  q: number,
  duration: number,
  volume: number,
  delay = 0,
) {
  const c = getCtx()
  const start = c.currentTime + delay

  // White noise source
  const bufLen = Math.ceil(c.sampleRate * duration)
  const buf = c.createBuffer(1, bufLen, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf

  // Bandpass shapes noise into a woody resonance
  const bp = c.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = freq
  bp.Q.value = q

  // Sharp percussive envelope
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.002) // 2ms attack
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  src.connect(bp)
  bp.connect(gain)
  gain.connect(c.destination)
  src.start(start)
  src.stop(start + duration + 0.01)
}

// Soft sine tone for melodic feedback (solve / fail)
function tone(freq: number, duration: number, volume = 0.25, delay = 0) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = "sine"
  osc.frequency.value = freq
  const start = c.currentTime + delay
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start)
  osc.stop(start + duration + 0.01)
}

export const sounds = {
  // Crisp snap — short high-freq burst with tight Q
  move() {
    woodClick(3200, 14, 0.025, 0.62)
  },
  // Heavier thud — piece lands on a captured piece then board
  capture() {
    woodClick(950, 2.5, 0.06, 0.5)
    woodClick(1200, 3, 0.11, 0.4, 0.03)
  },
  // Quieter snap for opponent's auto-played response
  opponent() {
    woodClick(3000, 12, 0.025, 0.4)
  },
  // Dull thud — the move didn't land right
  wrong() {
    woodClick(500, 1.5, 0.12, 0.45)
    woodClick(350, 1.2, 0.18, 0.3, 0.06)
  },
  // Ascending chime
  solve() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => tone(f, 0.3, 0.22, i * 0.13))
  },
  // Descending dull tone
  fail() {
    tone(350, 0.2, 0.25)
    tone(240, 0.35, 0.2, 0.15)
  },
}
