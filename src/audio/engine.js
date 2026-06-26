/**
 * Procedural Audio Engine using Web Audio API
 * Generates all game sounds procedurally using oscillators and noise buffers.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.initialized = false;
    this.noiseBuffer = null;
    this.sounds = {};
  }

  _init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
    this._createNoiseBuffer();
    this._createSounds();
    this.initialized = true;
  }

  resume() {
    this._init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(v) {
    if (!this.masterGain) return;
    this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  /**
   * Play a named sound effect
   * @param {string} name - Sound name
   * @param {number} volume - Volume multiplier (0-1)
   * @param {number} pitch - Pitch multiplier (0.5-2)
   */
  play(name, volume = 1, pitch = 1) {
    if (!this.initialized) {
      this._init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const generator = this.sounds[name];
    if (!generator) {
      console.warn(`AudioEngine: unknown sound "${name}"`);
      return;
    }

    try {
      generator(volume, pitch);
    } catch (e) {
      // Audio context might not be ready
    }
  }

  _createNoiseBuffer() {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  _noise(duration, volume = 0.5) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.ctx.currentTime);
    source.stop(this.ctx.currentTime + duration);
    return { source, gain };
  }

  _osc(type, freq, duration, volume = 0.3) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
    return { osc, gain };
  }

  _createSounds() {
    const now = () => this.ctx.currentTime;

    // block_break: 0.25s crunch noise
    this.sounds.block_break = (vol, pitch) => {
      const t = now();
      const { gain } = this._noise(0.25, vol * 0.4);
      gain.gain.setValueAtTime(vol * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      // Add a short low click
      const { osc, gain: g2 } = this._osc('square', 80 * pitch, 0.05, vol * 0.3);
      g2.gain.setValueAtTime(vol * 0.3, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    };

    // block_place: 0.15s click
    this.sounds.block_place = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('square', 200 * pitch, 0.15, vol * 0.3);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      const { gain: g2 } = this._noise(0.08, vol * 0.2);
      g2.gain.setValueAtTime(vol * 0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    };

    // sword_swing: 0.35s whoosh
    this.sounds.sword_swing = (vol, pitch) => {
      const t = now();
      // Swept noise
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 * pitch, t);
      filter.frequency.exponentialRampToValueAtTime(2000 * pitch, t + 0.15);
      filter.frequency.exponentialRampToValueAtTime(400 * pitch, t + 0.35);
      filter.Q.value = 2;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
      source.stop(t + 0.35);
    };

    // sword_hit: 0.30s impact
    this.sounds.sword_hit = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('square', 150 * pitch, 0.1, vol * 0.4);
      gain.gain.setValueAtTime(vol * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      const { gain: g2 } = this._noise(0.15, vol * 0.3);
      g2.gain.setValueAtTime(vol * 0.3, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      const { osc: osc2, gain: g3 } = this._osc('sine', 300 * pitch, 0.08, vol * 0.2);
      g3.gain.setValueAtTime(vol * 0.2, t);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    };

    // crit_hit: 0.40s louder impact + sparkle
    this.sounds.crit_hit = (vol, pitch) => {
      const t = now();
      this.sounds.sword_hit(vol * 1.5, pitch);

      // Sparkle overtone
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.05;
        const { osc, gain } = this._osc('sine', (1200 + i * 400) * pitch, 0.2, vol * 0.15);
        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(vol * 0.15, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
      }
    };

    // damage: 0.30s hurt
    this.sounds.damage = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('sawtooth', 200 * pitch, 0.3, vol * 0.3);
      osc.frequency.setValueAtTime(200 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(100 * pitch, t + 0.3);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      const { gain: g2 } = this._noise(0.15, vol * 0.2);
      g2.gain.setValueAtTime(vol * 0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    };

    // mob_death: 0.50s descending tone
    this.sounds.mob_death = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('sawtooth', 300 * pitch, 0.5, vol * 0.3);
      osc.frequency.setValueAtTime(300 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(50 * pitch, t + 0.5);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      const { gain: g2 } = this._noise(0.2, vol * 0.15);
      g2.gain.setValueAtTime(vol * 0.15, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    };

    // footstep_grass: 0.12s soft step
    this.sounds.footstep_grass = (vol, pitch) => {
      const t = now();
      const { gain } = this._noise(0.12, vol * 0.15);
      gain.gain.setValueAtTime(vol * 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      const { osc, gain: g2 } = this._osc('sine', 80 * pitch, 0.05, vol * 0.1);
      g2.gain.setValueAtTime(vol * 0.1, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    };

    // footstep_stone: 0.10s hard step
    this.sounds.footstep_stone = (vol, pitch) => {
      const t = now();
      const { gain } = this._noise(0.1, vol * 0.2);
      gain.gain.setValueAtTime(vol * 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      const { osc, gain: g2 } = this._osc('square', 120 * pitch, 0.04, vol * 0.15);
      g2.gain.setValueAtTime(vol * 0.15, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    };

    // eat: 0.40s munch
    this.sounds.eat = (vol, pitch) => {
      const t = now();
      for (let i = 0; i < 3; i++) {
        const delay = i * 0.12;
        const { osc, gain } = this._osc('square', 100 * pitch, 0.08, vol * 0.2);
        osc.frequency.setValueAtTime(100 * pitch, t + delay);
        osc.frequency.exponentialRampToValueAtTime(60 * pitch, t + delay + 0.08);
        gain.gain.setValueAtTime(vol * 0.2, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);
      }
    };

    // drink: 0.50s gulp
    this.sounds.drink = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('sine', 400 * pitch, 0.5, vol * 0.2);
      osc.frequency.setValueAtTime(600 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(200 * pitch, t + 0.5);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.2, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    };

    // pickup: 0.30s ding
    this.sounds.pickup = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('sine', 800 * pitch, 0.3, vol * 0.25);
      osc.frequency.setValueAtTime(800 * pitch, t);
      osc.frequency.linearRampToValueAtTime(1200 * pitch, t + 0.1);
      gain.gain.setValueAtTime(vol * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    };

    // level_up: 0.80s ascending notes
    this.sounds.level_up = (vol, pitch) => {
      const t = now();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const delay = i * 0.15;
        const { osc, gain } = this._osc('sine', freq * pitch, 0.4, vol * 0.2);
        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(vol * 0.2, t + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);
      });

      // Add sparkle
      const { osc: osc2, gain: g2 } = this._osc('sine', 1200 * pitch, 0.6, vol * 0.1);
      g2.gain.setValueAtTime(0.001, t + 0.2);
      g2.gain.linearRampToValueAtTime(vol * 0.1, t + 0.3);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    };

    // player_death: 1.20s descending
    this.sounds.player_death = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('sawtooth', 400 * pitch, 1.2, vol * 0.3);
      osc.frequency.setValueAtTime(400 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(40 * pitch, t + 1.2);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      // Distortion noise
      const { gain: g2 } = this._noise(0.8, vol * 0.2);
      g2.gain.setValueAtTime(vol * 0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      // Sub bass rumble
      const { osc: osc2, gain: g3 } = this._osc('sine', 40 * pitch, 1.0, vol * 0.25);
      g3.gain.setValueAtTime(vol * 0.25, t);
      g3.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    };

    // explosion: 0.80s boom
    this.sounds.explosion = (vol, pitch) => {
      const t = now();
      // Heavy noise burst
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000 * pitch, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.8);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
      source.stop(t + 0.8);

      // Sub boom
      const { osc, gain: g2 } = this._osc('sine', 60 * pitch, 0.6, vol * 0.4);
      g2.gain.setValueAtTime(vol * 0.4, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    };

    // cave_ambient: 2.0s eerie
    this.sounds.cave_ambient = (vol, pitch) => {
      const t = now();
      // Low drone
      const { osc, gain } = this._osc('sine', 80 * pitch, 2.0, vol * 0.1);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.1, t + 0.5);
      gain.gain.setValueAtTime(vol * 0.1, t + 1.5);
      gain.gain.linearRampToValueAtTime(0.001, t + 2.0);

      // High eerie tone
      const { osc: osc2, gain: g2 } = this._osc('sine', 440 * pitch, 2.0, vol * 0.05);
      osc2.frequency.setValueAtTime(440 * pitch, t);
      osc2.frequency.linearRampToValueAtTime(460 * pitch, t + 1.0);
      osc2.frequency.linearRampToValueAtTime(440 * pitch, t + 2.0);
      g2.gain.setValueAtTime(0.001, t);
      g2.gain.linearRampToValueAtTime(vol * 0.05, t + 0.8);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

      // Dripping noise
      for (let i = 0; i < 4; i++) {
        const delay = 0.3 + i * 0.4 + Math.random() * 0.2;
        const { osc: osc3, gain: g3 } = this._osc('sine', (600 + Math.random() * 400) * pitch, 0.1, vol * 0.05);
        g3.gain.setValueAtTime(vol * 0.05, t + delay);
        g3.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      }
    };

    // night_ambient: 2.0s wind
    this.sounds.night_ambient = (vol, pitch) => {
      const t = now();
      // Filtered noise (wind)
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400 * pitch, t);
      filter.frequency.linearRampToValueAtTime(600 * pitch, t + 1.0);
      filter.frequency.linearRampToValueAtTime(300 * pitch, t + 2.0);
      filter.Q.value = 3;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.1, t + 0.5);
      gain.gain.setValueAtTime(vol * 0.1, t + 1.5);
      gain.gain.linearRampToValueAtTime(0.001, t + 2.0);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
      source.stop(t + 2.0);
    };

    // boss_spawn: 1.50s dramatic
    this.sounds.boss_spawn = (vol, pitch) => {
      const t = now();
      // Rising rumble
      const { osc, gain } = this._osc('sawtooth', 60 * pitch, 1.5, vol * 0.25);
      osc.frequency.setValueAtTime(60 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(200 * pitch, t + 1.0);
      osc.frequency.exponentialRampToValueAtTime(100 * pitch, t + 1.5);
      gain.gain.setValueAtTime(vol * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      // Impact at apex
      const delay = 1.0;
      const { osc: osc2, gain: g2 } = this._osc('sine', 80 * pitch, 0.5, vol * 0.4);
      g2.gain.setValueAtTime(vol * 0.4, t + delay);
      g2.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);

      // Noise burst
      const { gain: g3 } = this._noise(0.4, vol * 0.3);
      g3.gain.setValueAtTime(0.001, t + delay);
      g3.gain.linearRampToValueAtTime(vol * 0.3, t + delay + 0.05);
      g3.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);

      // Dramatic chord
      const notes = [130, 165, 196]; // C3, E3, G3
      notes.forEach((freq, i) => {
        const { osc: o, gain: g } = this._osc('sine', freq * pitch, 0.8, vol * 0.15);
        g.gain.setValueAtTime(0.001, t + 0.8);
        g.gain.linearRampToValueAtTime(vol * 0.15, t + 0.9);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      });
    };

    // shrine: 1.00s magical
    this.sounds.shrine = (vol, pitch) => {
      const t = now();
      // Ethereal shimmer
      const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
      notes.forEach((freq, i) => {
        const delay = i * 0.1;
        const { osc, gain } = this._osc('sine', freq * pitch, 0.6, vol * 0.1);
        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(vol * 0.1, t + delay + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.6);
      });

      // Sub shimmer
      const { osc, gain } = this._osc('sine', 261 * pitch, 1.0, vol * 0.15);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.15, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    };

    // portal: 1.20s warp
    this.sounds.portal = (vol, pitch) => {
      const t = now();
      // Sweeping oscillator
      const { osc, gain } = this._osc('sine', 200 * pitch, 1.2, vol * 0.2);
      osc.frequency.setValueAtTime(200 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(800 * pitch, t + 0.6);
      osc.frequency.exponentialRampToValueAtTime(200 * pitch, t + 1.2);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(vol * 0.2, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      // Filtered noise sweep
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(2000, t + 0.6);
      filter.frequency.exponentialRampToValueAtTime(300, t + 1.2);
      filter.Q.value = 5;
      const g2 = this.ctx.createGain();
      g2.gain.setValueAtTime(0.001, t);
      g2.gain.linearRampToValueAtTime(vol * 0.15, t + 0.3);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      source.connect(filter);
      filter.connect(g2);
      g2.connect(this.masterGain);
      source.start(t);
      source.stop(t + 1.2);
    };

    // arrow_shoot: 0.40s twang
    this.sounds.arrow_shoot = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('triangle', 300 * pitch, 0.4, vol * 0.3);
      osc.frequency.setValueAtTime(300 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(100 * pitch, t + 0.4);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      // Noise
      const { gain: g2 } = this._noise(0.1, vol * 0.15);
      g2.gain.setValueAtTime(vol * 0.15, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    };

    // arrow_hit: 0.20s thunk
    this.sounds.arrow_hit = (vol, pitch) => {
      const t = now();
      const { osc, gain } = this._osc('square', 150 * pitch, 0.1, vol * 0.3);
      gain.gain.setValueAtTime(vol * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      const { gain: g2 } = this._noise(0.08, vol * 0.2);
      g2.gain.setValueAtTime(vol * 0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    };
  }
}
