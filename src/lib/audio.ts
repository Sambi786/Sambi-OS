
const audioContext: AudioContext | null = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export type SoundMode = 'sound' | 'vibrate' | 'mute';

export const getSoundMode = (): SoundMode => {
  if (typeof window === 'undefined') return 'sound';
  return (localStorage.getItem('sambi_sound_mode') as SoundMode) || 'sound';
};

export const setSoundMode = (mode: SoundMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sambi_sound_mode', mode);
    window.dispatchEvent(new Event('sambi_sound_mode_changed'));
  }
};

const createGain = (ctx: AudioContext, startTime: number, duration: number, startVolume: number) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(startVolume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  return gain;
};

export const playSound = (type: 'launch' | 'minimize' | 'notification' | 'click' | 'close') => {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const mode = getSoundMode();
  const now = audioContext.currentTime;

  if (mode === 'mute') return;

  if (mode === 'vibrate') {
    // Generate a low tactile rumbling/buzzing sound to simulate physical hardware motor vibration
    try {
      const buzzOsc = audioContext.createOscillator();
      const buzzGain = createGain(audioContext, now, 0.18, 0.4);
      
      buzzOsc.type = 'sawtooth';
      // Low dual frequency beats for motor simulation
      buzzOsc.frequency.setValueAtTime(65, now);
      buzzOsc.frequency.linearRampToValueAtTime(55, now + 0.18);
      
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);
      
      buzzOsc.connect(buzzGain);
      buzzGain.connect(filter).connect(audioContext.destination);
      
      buzzOsc.start(now);
      buzzOsc.stop(now + 0.18);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([120, 60, 100]);
      }

      window.dispatchEvent(new CustomEvent('sambi_vibrate', { detail: { type } }));
    } catch (e) {
      console.error('Vibration sound simulation synthesis failed', e);
    }
    return;
  }

  switch (type) {
    case 'launch': {
      // Upward sine sweep
      const osc = audioContext.createOscillator();
      const gain = createGain(audioContext, now, 0.4, 0.1);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }
    case 'minimize': {
      // Downward frequency slide
      const osc = audioContext.createOscillator();
      const gain = createGain(audioContext, now, 0.3, 0.08);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
      
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'close': {
        const osc = audioContext.createOscillator();
        const gain = createGain(audioContext, now, 0.2, 0.08);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        
        osc.connect(gain).connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
    case 'notification': {
      // Soft chime (Harmonic)
      const frequencies = [880, 1108.73, 1318.51]; // A5, C#6, E6 (A Major)
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = createGain(audioContext, now + (index * 0.05), 1.0, 0.05);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (index * 0.05));
        
        osc.connect(gain).connect(audioContext.destination);
        osc.start(now + (index * 0.05));
        osc.stop(now + 1.2);
      });
      break;
    }
    case 'click': {
      // Short tick
      const osc = audioContext.createOscillator();
      const gain = createGain(audioContext, now, 0.05, 0.15);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
  }
};
