/**
 * Web Audio API synthesizer for crisp, instant restaurant alerts without external audio files.
 */
class SoundManager {
  constructor() {
    this.ctx = null
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  /**
   * Sound played when a new order arrives at the kitchen (double high chime / bell)
   */
  playKitchenOrderBell() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime

      // Tone 1
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(880, now) // A5
      gain1.gain.setValueAtTime(0.25, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.35)

      // Tone 2
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(1174.66, now + 0.12) // D6
      gain2.gain.setValueAtTime(0.28, now + 0.12)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)
      osc2.start(now + 0.12)
      osc2.stop(now + 0.55)
    } catch {
      // AudioContext could be blocked by browser autoplay policy until user gesture
    }
  }

  /**
   * Sound played when food is ready for pickup by waiter (pleasant 3-tone ascending chime)
   */
  playFoodReadyChime() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const notes = [659.25, 880, 1318.51] // E5, A5, E6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        const noteStart = now + idx * 0.1
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, noteStart)
        gain.gain.setValueAtTime(0.25, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(noteStart)
        osc.stop(noteStart + 0.4)
      })
    } catch {
      // AudioContext policy
    }
  }

  /**
   * Subtle click / notification ping
   */
  playPop() {
    try {
      this.init()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.2)
    } catch {}
  }
}

export const soundManager = new SoundManager()
