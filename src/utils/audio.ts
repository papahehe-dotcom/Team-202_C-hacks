import { safeStorage } from './storage';
import { AudioSettings } from '../types/game';

class GameAudioEngine {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;

  private settings: AudioSettings = {
    musicVolume: 0.4,
    sfxVolume: 0.8,
    voiceEnabled: true,
    masterMute: false,
  };

  constructor() {
    const saved = safeStorage.getItem('earth_savers_audio_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch {}
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.updateGainLevels();
        this.bgmGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    safeStorage.setItem('earth_savers_audio_settings', JSON.stringify(this.settings));
    this.updateGainLevels();
    if (this.settings.masterMute || !this.settings.voiceEnabled) {
      this.stopSpeaking();
    }
  }

  private updateGainLevels() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.bgmGain) {
      const vol = this.settings.masterMute ? 0 : this.settings.musicVolume * 0.15;
      this.bgmGain.gain.setValueAtTime(vol, now);
    }
    if (this.sfxGain) {
      const vol = this.settings.masterMute ? 0 : this.settings.sfxVolume * 0.4;
      this.sfxGain.gain.setValueAtTime(vol, now);
    }
  }

  // --- Web Audio Synthesizer SFX ---

  public playCoin() {
    if (this.settings.masterMute || this.settings.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Pleasant coin ding: B5 -> E6
    const freqs = [987.77, 1318.51];
    freqs.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  public playClick() {
    if (this.settings.masterMute || this.settings.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playWarning() {
    if (this.settings.masterMute || this.settings.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.15);
    osc.frequency.linearRampToValueAtTime(320, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playSuccess() {
    if (this.settings.masterMute || this.settings.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A Major arpeggio
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  public playCelebration() {
    if (this.settings.masterMute || this.settings.sfxVolume <= 0) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chords = [
      { t: 0, freqs: [261.63, 329.63, 392] },       // C
      { t: 0.18, freqs: [329.63, 392, 523.25] },    // E minor / G
      { t: 0.36, freqs: [349.23, 440, 523.25] },    // F
      { t: 0.58, freqs: [392, 523.25, 659.25, 783.99] } // C major grand
    ];

    chords.forEach(({ t, freqs }) => {
      freqs.forEach(freq => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.14, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(start);
        osc.stop(start + 0.65);
      });
    });
  }

  // --- Voice Narration via Web Speech API ---

  public speak(text: string) {
    if (this.settings.masterMute || !this.settings.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop prior sentence
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.25; // Friendly, youthful Earthy tone
      utterance.rate = 1.05;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis fallback
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const gameAudio = new GameAudioEngine();
