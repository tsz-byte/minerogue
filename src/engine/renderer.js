/**
 * MineRogue - Game Renderer
 * Three.js WebGL renderer, camera, scene, and fog management.
 */
import * as THREE from 'three';

export class GameRenderer {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      pixelRatio: 1,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 300);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    // Fog for distance fade
    this.fogColor = new THREE.Color(0x87ceeb);
    this.fogDensity = 0.012;
    this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity);

    // Basic lighting
    this._setupLighting();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  _setupLighting() {
    // Hemisphere light for ambient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8888aa, 0.8);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    // Directional light for sun
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(100, 200, 100);
    this.scene.add(dirLight);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }

  setFogColor(color) {
    this.fogColor.set(color);
    if (this.scene.fog) {
      this.scene.fog.color.set(color);
    }
  }

  setFogDensity(density) {
    this.fogDensity = density;
    if (this.scene.fog) {
      this.scene.fog.density = density;
    }
  }
}
