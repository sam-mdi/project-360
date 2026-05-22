import { Howl } from 'howler';
import type { NotificationSound } from './types';

// Use short data URIs for demo sounds (sine wave tones generated inline)
// In production these would be real audio files

const SOUND_CONFIGS: Record<NotificationSound, { label: string; src?: string[] }> = {
  none:     { label: 'None' },
  vibrate:  { label: 'Vibrate Only' },
  system:   { label: 'System Default' },
  alarm80s: { label: '80s Alarm' },
  airhorn:  { label: 'Airhorn' },
  angklung: { label: 'Angklung' },
  whistle:  { label: 'Attention Whistle' },
  boing:    { label: 'Boing' },
  ding:     { label: 'Ding' },
  chime:    { label: 'Chime' },
  bell:     { label: 'Bell' },
  piano:    { label: 'Piano' },
};

export const SOUND_LABELS = SOUND_CONFIGS;

let currentHowl: Howl | null = null;

function generateBeepDataURI(freq: number, duration: number, type: OscillatorType = 'sine'): string {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, Math.min(t / 0.01, (duration - t) / 0.05));
    let sample = 0;
    if (type === 'sine') sample = Math.sin(2 * Math.PI * freq * t);
    else if (type === 'square') sample = Math.sign(Math.sin(2 * Math.PI * freq * t));
    else if (type === 'sawtooth') sample = 2 * ((t * freq) % 1) - 1;
    view.setInt16(44 + i * 2, sample * envelope * 16000, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(binary);
}

const SOUND_FREQS: Partial<Record<NotificationSound, { freq: number; dur: number; type?: OscillatorType }>> = {
  ding:     { freq: 880, dur: 0.5 },
  chime:    { freq: 660, dur: 0.8 },
  bell:     { freq: 440, dur: 1.0 },
  piano:    { freq: 523, dur: 0.6 },
  boing:    { freq: 300, dur: 0.4, type: 'sawtooth' },
  alarm80s: { freq: 800, dur: 0.3, type: 'square' },
  airhorn:  { freq: 200, dur: 0.5, type: 'sawtooth' },
  angklung: { freq: 740, dur: 0.7 },
  whistle:  { freq: 1200, dur: 0.3 },
};

export function playSound(sound: NotificationSound) {
  if (sound === 'none' || sound === 'vibrate') return;

  if (currentHowl) {
    currentHowl.stop();
    currentHowl = null;
  }

  const cfg = SOUND_FREQS[sound];
  if (!cfg) return;

  try {
    const dataURI = generateBeepDataURI(cfg.freq, cfg.dur, cfg.type);
    const howl = new Howl({ src: [dataURI], volume: 0.6 });
    howl.play();
    currentHowl = howl;
  } catch {
    // ignore audio errors silently
  }
}

export const SOUND_OPTIONS: NotificationSound[] = [
  'none', 'vibrate', 'system', 'alarm80s', 'airhorn',
  'angklung', 'whistle', 'boing', 'ding', 'chime', 'bell', 'piano',
];
