let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

// Filtered white-noise burst — used for wrong/fail thuds
function woodClick(
  freq: number,
  q: number,
  duration: number,
  volume: number,
  delay = 0,
) {
  const c = getCtx()
  const start = c.currentTime + 0.05 + delay

  const bufLen = Math.ceil(c.sampleRate * duration)
  const buf = c.createBuffer(1, bufLen, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = freq
  bp.Q.value = q

  const gain = c.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)

  src.connect(bp)
  bp.connect(gain)
  gain.connect(c.destination)
  src.start(start)
  src.stop(start + duration + 0.01)
}

// Single wooden piece placement: brief sine click + warm bandpass noise body
function piecePlace(volume = 1, delay = 0) {
  const c = getCtx()
  const start = c.currentTime + 0.05 + delay

  // ~6ms sine burst — tactile impact click, decays before it can ring
  const osc = c.createOscillator()
  const oscGain = c.createGain()
  osc.type = "sine"
  osc.frequency.value = 2200
  oscGain.gain.setValueAtTime(0.2 * volume, start)
  oscGain.gain.exponentialRampToValueAtTime(0.001, start + 0.006)
  osc.connect(oscGain)
  oscGain.connect(c.destination)
  osc.start(start)
  osc.stop(start + 0.008)

  // Warm 1000 Hz noise body — woody, moderate Q to avoid ringing
  const bufLen = Math.ceil(c.sampleRate * 0.12)
  const buf = c.createBuffer(1, bufLen, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = 1000
  bp.Q.value = 7

  const gain = c.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.42 * volume, start + 0.0005)
  gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12)

  src.connect(bp)
  bp.connect(gain)
  gain.connect(c.destination)
  src.start(start)
  src.stop(start + 0.13)
}

// One impact layer for capture: sine click + bandpass noise
function captureImpact(
  sineFreq: number,
  sineDuration: number,
  sineVol: number,
  noiseFreq: number,
  noiseQ: number,
  noiseDuration: number,
  noiseVol: number,
  delay: number,
) {
  const c = getCtx()
  const start = c.currentTime + 0.05 + delay

  const osc = c.createOscillator()
  const oscGain = c.createGain()
  osc.type = "sine"
  osc.frequency.value = sineFreq
  oscGain.gain.setValueAtTime(sineVol, start)
  oscGain.gain.exponentialRampToValueAtTime(0.001, start + sineDuration)
  osc.connect(oscGain)
  oscGain.connect(c.destination)
  osc.start(start)
  osc.stop(start + sineDuration + 0.002)

  const bufLen = Math.ceil(c.sampleRate * noiseDuration)
  const buf = c.createBuffer(1, bufLen, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf

  const bp = c.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = noiseFreq
  bp.Q.value = noiseQ

  const gain = c.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(noiseVol, start + 0.0005)
  gain.gain.exponentialRampToValueAtTime(0.001, start + noiseDuration)

  src.connect(bp)
  bp.connect(gain)
  gain.connect(c.destination)
  src.start(start)
  src.stop(start + noiseDuration + 0.01)
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
  const start = c.currentTime + 0.05 + delay
  gain.gain.setValueAtTime(volume, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start)
  osc.stop(start + duration + 0.01)
}

export const sounds = {
  move() {
    piecePlace(1.0)
  },
  // Two-impact capture: sharp primary (attacker) + softer secondary (piece displaced) ~35ms later
  capture() {
    // Primary: brighter, stronger — the attacking piece making contact
    captureImpact(2600, 0.007, 0.3,  1200, 8, 0.14, 0.58, 0)
    // Secondary: warmer, quieter — the captured piece leaving the square
    captureImpact(1900, 0.005, 0.18, 950,  6, 0.11, 0.34, 0.038)
  },
  opponent() {
    piecePlace(0.65)
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
