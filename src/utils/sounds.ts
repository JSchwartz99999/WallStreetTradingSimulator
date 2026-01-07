// Sound effects manager using Web Audio API

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.1
  ): void {
    if (!this.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may not be available
    }
  }

  // Success sound - ascending tones
  playBuy(): void {
    this.playTone(440, 0.1, 'sine', 0.08);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.08), 50);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.08), 100);
  }

  // Sell sound - descending tones
  playSell(): void {
    this.playTone(659, 0.1, 'sine', 0.08);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.08), 50);
    setTimeout(() => this.playTone(440, 0.15, 'sine', 0.08), 100);
  }

  // Error sound
  playError(): void {
    this.playTone(200, 0.15, 'square', 0.05);
    setTimeout(() => this.playTone(180, 0.2, 'square', 0.05), 100);
  }

  // Alert triggered sound
  playAlert(): void {
    this.playTone(880, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(880, 0.1, 'sine', 0.1), 150);
    setTimeout(() => this.playTone(1100, 0.2, 'sine', 0.1), 300);
  }

  // Click sound
  playClick(): void {
    this.playTone(600, 0.05, 'sine', 0.03);
  }

  // Notification sound
  playNotification(): void {
    this.playTone(523, 0.1, 'sine', 0.08);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.08), 100);
  }
}

export const soundManager = new SoundManager();
