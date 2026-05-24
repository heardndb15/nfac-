// Simple WebAudio ambience + glitch sfx, no external assets.
let ctx: AudioContext | null = null;
let humGain: GainNode | null = null;
let started = false;

function ensure() {
  if (!ctx) {
    const AC = (window.AudioContext || (window as any).webkitAudioContext);
    ctx = new AC();
  }
  return ctx!;
}

export function startAmbience() {
  if (started) return;
  const c = ensure();
  if (c.state === "suspended") c.resume();
  started = true;

  // Low hum
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = 55;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 6;
  lfo.connect(lfoGain).connect(osc.frequency);

  humGain = c.createGain();
  humGain.gain.value = 0.025;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;

  osc.connect(filter).connect(humGain).connect(c.destination);
  osc.start();
  lfo.start();

  // Static noise
  const bufferSize = 2 * c.sampleRate;
  const noiseBuffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.5;
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.008;
  const noiseFilter = c.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1100;
  noise.connect(noiseFilter).connect(noiseGain).connect(c.destination);
  noise.start();
}

export function glitchBlip() {
  if (!started) return;
  const c = ensure();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.value = 200 + Math.random() * 800;
  g.gain.value = 0.05;
  o.connect(g).connect(c.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.1);
  o.stop(c.currentTime + 0.12);
}

export function movePulse() {
  if (!started) return;
  const c = ensure();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "triangle";
  o.frequency.value = 320;
  g.gain.value = 0.04;
  o.connect(g).connect(c.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.14);
  o.stop(c.currentTime + 0.16);
}

export function heartbeat() {
  if (!started) return;
  const c = ensure();
  [0, 0.18].forEach((t) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 60;
    g.gain.value = 0.0001;
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.18);
    o.stop(c.currentTime + t + 0.2);
  });
}

export function setHumLevel(v: number) {
  if (humGain) humGain.gain.value = v;
}
