// Day/Night cycle system
import * as THREE from 'three';

export class DayNightCycle {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    // Time: 0-1 normalized (0=dawn, 0.25=noon, 0.5=dusk, 0.75=midnight)
    this.time = 0.1; // start at dawn
    this.cycleDuration = 600; // seconds for full day
    this.speed = 1;

    // Sky colors at key points
    this.skyColors = {
      dawn:      new THREE.Color(0xff9966),  // warm orange-pink
      noon:      new THREE.Color(0x87ceeb),  // light blue
      dusk:      new THREE.Color(0xff6633),  // deep orange
      midnight:  new THREE.Color(0x0a0a2a),  // very dark blue
    };

    // Fog colors match sky
    this.fogColors = {
      dawn:      new THREE.Color(0xffccaa),
      noon:      new THREE.Color(0xc8e8ff),
      dusk:      new THREE.Color(0xffaa77),
      midnight:  new THREE.Color(0x050515),
    };

    // Ambient intensities
    this.ambientIntensities = {
      dawn: 0.4,
      noon: 0.8,
      dusk: 0.35,
      midnight: 0.08,
    };

    // Directional light intensities
    this.sunIntensities = {
      dawn: 0.4,
      noon: 1.0,
      dusk: 0.3,
      midnight: 0.0,
    };

    // Scene fog
    this.scene.fog = new THREE.FogExp2(0xc8e8ff, 0.008);

    // Directional light (sun)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sunLight.castShadow = false; // disabled for performance
    this.sunLight.position.set(50, 100, 50);
    scene.add(this.sunLight);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(this.ambientLight);

    // Hemisphere light for subtle sky/ground coloring
    this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x554433, 0.3);
    scene.add(this.hemiLight);

    // Stars (visible at night)
    this._createStars();

    // Moon
    this._createMoon();

    // Phase tracking
    this._lastPhase = 'dawn';
    this._listeners = [];
  }

  _createStars() {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 400;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)); // only upper hemisphere
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
    });
    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  _createMoon() {
    const geo = new THREE.SphereGeometry(8, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0xeeeeff });
    this.moon = new THREE.Mesh(geo, mat);
    this.moon.visible = true;
    this.scene.add(this.moon);
  }

  /**
   * Add a phase change listener: fn(phase: string)
   */
  onPhaseChange(fn) {
    this._listeners.push(fn);
  }

  /**
   * Update the day/night cycle
   */
  update(dt) {
    if (this.permanentDay) {
      this.time = 0.25;
      // Still update lighting for the current time
      const t = this.time;
      const skyColor = this._lerpColor(t);
      this.renderer.setClearColor(skyColor);
      if (this.scene.fog) this.scene.fog.color.copy(this._lerpFogColor(t));
      this.ambientLight.intensity = this._lerpValue(t, this.ambientIntensities);
      this.sunLight.intensity = this._lerpValue(t, this.sunIntensities);
      this.sunLight.position.set(0, 200, 50);
      this.sunLight.color.setHex(0xffffff);
      this.stars.material.opacity = 0;
      this.moon.visible = false;
      this.hemiLight.color.copy(skyColor);
      return;
    }

    // Advance time
    this.time += (dt * this.speed) / this.cycleDuration;
    if (this.time >= 1) this.time -= 1;

    const t = this.time;
    const phase = this.getPhase();

    // Fire phase change events
    if (phase !== this._lastPhase) {
      for (const fn of this._listeners) fn(phase);
      this._lastPhase = phase;
    }

    // Interpolate sky color
    const skyColor = this._lerpColor(t);
    this.renderer.setClearColor(skyColor);
    if (this.scene.fog) {
      this.scene.fog.color.copy(this._lerpFogColor(t));
    }

    // Interpolate lighting
    this.ambientLight.intensity = this._lerpValue(t, this.ambientIntensities);
    this.sunLight.intensity = this._lerpValue(t, this.sunIntensities);

    // Sun position: rotate around world
    const sunAngle = t * Math.PI * 2 - Math.PI / 2; // noon at top
    const sunDist = 200;
    this.sunLight.position.set(
      Math.cos(sunAngle) * sunDist,
      Math.sin(sunAngle) * sunDist,
      50
    );

    // Sun color shifts warm at dawn/dusk
    if (t < 0.15 || t > 0.4) {
      this.sunLight.color.setHex(0xffddaa);
    } else {
      this.sunLight.color.setHex(0xffffff);
    }

    // Stars visibility: visible during night, fade during dawn/dusk
    let starOpacity = 0;
    if (t > 0.55 && t < 0.95) {
      starOpacity = 1;
    } else if (t > 0.45 && t <= 0.55) {
      starOpacity = (t - 0.45) / 0.1;
    } else if (t >= 0.95 || t < 0.05) {
      starOpacity = t >= 0.95 ? (1 - t) / 0.05 : 1 - (t / 0.05);
    }
    this.stars.material.opacity = Math.max(0, Math.min(1, starOpacity));

    // Moon opposite to sun
    const moonAngle = sunAngle + Math.PI;
    this.moon.position.set(
      Math.cos(moonAngle) * sunDist,
      Math.sin(moonAngle) * sunDist,
      -50
    );
    this.moon.visible = this.isDark();

    // Hemisphere light color
    this.hemiLight.color.copy(skyColor);
  }

  /**
   * Get time of day: 0-1
   */
  getTime() {
    return this.time;
  }

  /**
   * Get current phase
   */
  getPhase() {
    const t = this.time;
    if (t < 0.1) return 'dawn';
    if (t < 0.5) return 'day';
    if (t < 0.6) return 'dusk';
    return 'night';
  }

  /**
   * Get light level 3-15 (Minecraft-like)
   */
  getLightLevel() {
    const t = this.time;
    // Map time to light: noon=15, midnight=3
    // Use cosine curve
    const normalized = (Math.cos(t * Math.PI * 2) + 1) / 2; // 0 at midnight, 1 at noon
    return Math.round(3 + normalized * 12);
  }

  /**
   * Is it dark? (below light level 7)
   */
  isDark() {
    return this.getLightLevel() < 7;
  }

  /**
   * Set time directly (0-1)
   */
  setTime(t) {
    this.time = t % 1;
  }

  /**
   * Set speed multiplier
   */
  setSpeed(s) {
    this.speed = s;
  }

  // --- Interpolation helpers ---

  _lerpValue(t, values) {
    // Map t to segments: dawn(0-0.1), day(0.1-0.5), dusk(0.5-0.6), night(0.6-1.0)
    const segments = [
      { start: 0, end: 0.1, from: values.midnight, to: values.dawn },
      { start: 0.1, end: 0.25, from: values.dawn, to: values.noon },
      { start: 0.25, end: 0.5, from: values.noon, to: values.dusk },
      { start: 0.5, end: 0.6, from: values.dusk, to: values.midnight },
      { start: 0.6, end: 1.0, from: values.midnight, to: values.midnight },
    ];

    for (const seg of segments) {
      if (t >= seg.start && t < seg.end) {
        const localT = (t - seg.start) / (seg.end - seg.start);
        return seg.from + (seg.to - seg.from) * localT;
      }
    }
    return values.midnight;
  }

  _lerpColor(t) {
    const segments = [
      { start: 0, end: 0.1, from: this.skyColors.midnight, to: this.skyColors.dawn },
      { start: 0.1, end: 0.25, from: this.skyColors.dawn, to: this.skyColors.noon },
      { start: 0.25, end: 0.5, from: this.skyColors.noon, to: this.skyColors.dusk },
      { start: 0.5, end: 0.6, from: this.skyColors.dusk, to: this.skyColors.midnight },
      { start: 0.6, end: 1.0, from: this.skyColors.midnight, to: this.skyColors.midnight },
    ];

    for (const seg of segments) {
      if (t >= seg.start && t < seg.end) {
        const localT = (t - seg.start) / (seg.end - seg.start);
        const result = new THREE.Color();
        result.lerpColors(seg.from, seg.to, localT);
        return result;
      }
    }
    return this.skyColors.midnight;
  }

  _lerpFogColor(t) {
    const segments = [
      { start: 0, end: 0.1, from: this.fogColors.midnight, to: this.fogColors.dawn },
      { start: 0.1, end: 0.25, from: this.fogColors.dawn, to: this.fogColors.noon },
      { start: 0.25, end: 0.5, from: this.fogColors.noon, to: this.fogColors.dusk },
      { start: 0.5, end: 0.6, from: this.fogColors.dusk, to: this.fogColors.midnight },
      { start: 0.6, end: 1.0, from: this.fogColors.midnight, to: this.fogColors.midnight },
    ];

    for (const seg of segments) {
      if (t >= seg.start && t < seg.end) {
        const localT = (t - seg.start) / (seg.end - seg.start);
        const result = new THREE.Color();
        result.lerpColors(seg.from, seg.to, localT);
        return result;
      }
    }
    return this.fogColors.midnight;
  }

  setPermanentDay(val) {
    this.permanentDay = val;
    if (val) {
      this.time = 0.25; // noon
    }
  }
}
