// Simple sound effects using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Create a simple tone
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Attack sword swing sound
export function playSwordSwing() {
  playTone(200, 0.1, 'sawtooth', 0.2);
  setTimeout(() => playTone(150, 0.15, 'sawtooth', 0.15), 50);
}

// Hit impact sound
export function playHitSound() {
  playTone(100, 0.2, 'square', 0.3);
}

// Monster death sound
export function playMonsterDeath() {
  playTone(300, 0.1, 'sawtooth', 0.25);
  setTimeout(() => playTone(200, 0.15, 'sawtooth', 0.2), 100);
  setTimeout(() => playTone(100, 0.3, 'sine', 0.15), 200);
}

// Chest open sound
export function playChestOpen() {
  playTone(400, 0.1, 'triangle', 0.2);
  setTimeout(() => playTone(600, 0.2, 'triangle', 0.15), 100);
}

// Collect item sound
export function playItemCollect() {
  playTone(800, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(1000, 0.1, 'sine', 0.15), 100);
  setTimeout(() => playTone(1200, 0.15, 'sine', 0.1), 150);
}

// Level up sound
export function playLevelUp() {
  const notes = [523, 659, 784, 1047]; // C, E, G, C (one octave up)
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'triangle', 0.2), i * 100);
  });
}

// Door open sound
export function playDoorOpen() {
  playTone(200, 0.3, 'square', 0.15);
  setTimeout(() => playTone(150, 0.2, 'square', 0.1), 150);
}

// Player damage sound
export function playPlayerDamage() {
  playTone(150, 0.3, 'sawtooth', 0.3);
}
