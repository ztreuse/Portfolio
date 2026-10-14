import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/*
 * The preloader's 3D coffee scene (Three.js, loaded on demand by Preloader), rendered like a studio product shot.
 *
 * Realism comes from the setup around the PBR materials, not the material type:
 *  - a studio environment of softbox panels (a big warm key, a tall rim strip, an overhead light) baked into a PMREM
 *    map, so the glaze, saucer and coffee show soft studio reflections;
 *  - procedural roughness/bump detail, so no surface is perfectly smooth;
 *  - a dark tabletop that catches the soft shadow and fades into the page;
 *  - post-processing: a gentle depth of field focused on the cup.
 *
 * A glazed ceramic cup on a glossy dark saucer. Coffee pours in while the cup turns slowly; the level follows the
 * loading progress. finale(): the coffee swells over the rim, thin films run down the outside of the cup and a glossy
 * pool spreads across the saucer, then the camera swoops up over the cup and dives into the coffee.
 */

const GLAZE = '#d8cdc1'; // warm cream-taupe glaze (close to accent-strong)
// One latte-taupe coffee for everything liquid (stream, drips, pool), in the site's taupe family, so the overflow
// reads as the same coffee on the cup and on the saucer.
const COFFEE = '#2e221b';
const LIQUID = '#4a3529';
const LIQUID_LIGHT = '#5f4738'; // base for thickness-shaded films, which darken toward their middles
// Wet coffee: glossy, with a warm amber glow at grazing angles where light passes through thin liquid (sheen stands
// in for that translucency, which real-time transmission can't afford here)
const LIQUID_LOOK = {
  roughness: 0.1,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  sheen: 0.5,
  sheenColor: new THREE.Color('#5c4234'),
  sheenRoughness: 0.3,
};
const SAUCER = '#1d1916';
const INK = '#161513'; // page background, so the canvas blends into the page

// Cup (world units): base at y 0, rim at y 0.9; outer radius 0.34 at the base, 0.42 at the rim.
const CUP_H = 0.9;
const R_BASE = 0.34;
const R_RIM = 0.42;
const WALL = 0.032;
const FLOOR = 0.07;
const outerRadiusAt = (y) => R_BASE + ((R_RIM - R_BASE) * y) / CUP_H;
const innerRadiusAt = (y) => outerRadiusAt(y) - WALL;
const LEVEL_EMPTY = FLOOR + 0.01;
const LEVEL_FULL = CUP_H - 0.1;
const LEVEL_BRIM = CUP_H + 0.006;
const TABLE_Y = -0.047;
// Finale timeline (seconds after 100%)
const OVERFLOW_TIME = 1.4; // rise to the brim, dome up and creep over the rim, as one motion
const SPILL_AT = 0.75; // drips start (hidden under the dome over the lip) as it nears the lip's outer side
const SWOOP_AT = 2.9;
const DIVE_AT = 3.7;
const FINALE_END = 4.4;
// The rim is a half-round lip as wide as the wall
const LIP = WALL / 2;
const LIP_Y = CUP_H - LIP;
const LIP_MID = outerRadiusAt(LIP_Y) - LIP;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

const canvasTexture = (size, draw, color = false) => {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  draw(c.getContext('2d'), size);
  const tex = new THREE.CanvasTexture(c);
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
};

/** Fine grey noise: used as roughness and bump detail so surfaces aren't perfectly smooth. */
const noiseTexture = (base, spread, repeat) => {
  const tex = canvasTexture(256, (g, size) => {
    const img = g.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.max(0, Math.min(255, base + (Math.random() - 0.5) * spread));
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
};

/**
 * Crema: a foamy, taupe-brown head. The colour map has soft lighter foam patches, faint swirls and thousands of
 * bubbles of mixed sizes (a few larger ones with a light rim); a matching bump map raises each bubble as a little
 * dome with a darker cell wall around it, so the foam has real relief under the light.
 */
const cremaTextures = () => {
  const SIZE = 512;
  const mid = SIZE / 2;
  const bubbles = Array.from({ length: 9000 }, () => {
    const r = Math.sqrt(Math.random()) * (mid - 6);
    const a = Math.random() * Math.PI * 2;
    const big = Math.random() < 0.06;
    return {
      x: mid + Math.cos(a) * r,
      y: mid + Math.sin(a) * r,
      size: big ? 2.2 + Math.random() * 2.6 : 0.6 + Math.random() * 1.5,
      big,
      light: Math.random() < 0.55,
    };
  });
  const map = canvasTexture(
    SIZE,
    (g) => {
      const grad = g.createRadialGradient(mid * 0.94, mid * 0.92, 8, mid, mid, mid);
      grad.addColorStop(0, '#8c7665');
      grad.addColorStop(0.5, '#786252');
      grad.addColorStop(0.86, '#5e4a3c');
      grad.addColorStop(1, '#4a3529');
      g.fillStyle = grad;
      g.fillRect(0, 0, SIZE, SIZE);
      // Soft lighter patches of microfoam
      for (let i = 0; i < 140; i += 1) {
        const r = Math.sqrt(Math.random()) * (mid - 30);
        const a = Math.random() * Math.PI * 2;
        const x = mid + Math.cos(a) * r;
        const y = mid + Math.sin(a) * r;
        const rad = 8 + Math.random() * 22;
        const patch = g.createRadialGradient(x, y, 0, x, y, rad);
        patch.addColorStop(0, 'rgba(201,188,175,0.1)');
        patch.addColorStop(1, 'rgba(201,188,175,0)');
        g.fillStyle = patch;
        g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      for (let i = 0; i < 70; i += 1) {
        const r = 30 + Math.random() * (mid - 50);
        const a = Math.random() * Math.PI * 2;
        g.strokeStyle = Math.random() < 0.55 ? 'rgba(64,46,36,0.08)' : 'rgba(201,188,175,0.07)';
        g.lineWidth = 2 + Math.random() * 4;
        g.beginPath();
        g.arc(mid, mid, r, a, a + 0.5 + Math.random() * 1.6);
        g.stroke();
      }
      for (const b of bubbles) {
        g.fillStyle = b.light ? 'rgba(201,188,175,0.24)' : 'rgba(46,34,27,0.2)';
        g.beginPath();
        g.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        g.fill();
        if (b.big) {
          g.strokeStyle = 'rgba(214,204,194,0.22)';
          g.lineWidth = 0.7;
          g.stroke();
        }
      }
    },
    true,
  );
  const bump = canvasTexture(SIZE, (g) => {
    g.fillStyle = '#808080';
    g.fillRect(0, 0, SIZE, SIZE);
    for (const b of bubbles) {
      const r = b.size * 1.4;
      const dome = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      dome.addColorStop(0, 'rgba(255,255,255,0.55)');
      dome.addColorStop(0.7, 'rgba(160,160,160,0.25)');
      dome.addColorStop(1, 'rgba(40,40,40,0.35)');
      g.fillStyle = dome;
      g.beginPath();
      g.arc(b.x, b.y, r, 0, Math.PI * 2);
      g.fill();
    }
  });
  return { map, bump };
};

/**
 * The overflow sheet's alpha map (wraps around the cup; canvas top = the rim): a solid band at the lip, then
 * rivulets of varied width and length hanging from it, wobbling slightly and tapering, each ending in a bead. The
 * bottom rows stay empty, since the map is clamped there while it slides down.
 */
const rivuletTexture = () => {
  const W = 1024;
  const H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, 14);
  const dot = (x, y, r) => {
    for (const dx of [-W, 0, W]) {
      g.beginPath();
      g.arc(x + dx, y, r, 0, Math.PI * 2);
      g.fill();
    }
  };
  for (let i = 0; i < 38; i += 1) {
    const x0 = ((i + Math.random() * 0.8) / 38) * W;
    const width = 4 + Math.random() ** 2 * 18;
    const length = (i % 4 === 0 ? 0.92 : 0.18 + Math.random() * 0.7) * (H - 16);
    const seed = Math.random() * 10;
    for (let y = 0; y <= length; y += 1.5) {
      const r = (width / 2) * (1 - (0.35 * y) / length) * (y < 18 ? 1 + (18 - y) / 14 : 1);
      dot(x0 + Math.sin(y * 0.018 + seed) * 4, y, r);
    }
    dot(x0 + Math.sin(length * 0.018 + seed) * 4, length, width * 0.55);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  // Shade map: the rivulets blurred give their thickness, so the thick middles come out darker than their thin,
  // light-catching edges
  const s = document.createElement('canvas');
  s.width = W;
  s.height = H;
  const sg = s.getContext('2d');
  sg.filter = 'blur(4px)';
  sg.drawImage(c, 0, 0);
  const img = sg.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 255 - img.data[i] * 0.5;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
  }
  sg.putImageData(img, 0, 0);
  const shade = new THREE.CanvasTexture(s);
  shade.wrapS = THREE.RepeatWrapping;
  shade.colorSpace = THREE.SRGBColorSpace;
  shade.anisotropy = 4;
  return { tex, shade };
};

/** A soft round fade (white centre to black edge), used as the table's alpha so it melts into the page. */
const fadeTexture = () =>
  canvasTexture(256, (g, size) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, '#aaa');
    grad.addColorStop(0.42, '#333');
    grad.addColorStop(0.6, '#000');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });

/**
 * Steam: a camera-facing plane whose shader draws thin, curling wisps from domain-warped noise, drifting upward,
 * widening and breaking up as they rise, and fading at the bottom and top (instead of stacked round sprites).
 */
const STEAM_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const STEAM_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float y = vUv.y;
    float t = uTime + uSeed * 17.0;
    // Rising vapour: everything is sampled in coordinates that move up over time, so the pattern keeps flowing
    float rise = y - t * 0.16;
    // A slow, large warp bends and billows it; it grows with height, so the base stays over the cup and the top sways
    vec2 q = vec2(fbm(vec2(vUv.x * 1.6 + uSeed, rise * 1.3)), fbm(vec2(vUv.x * 1.6 + 4.2, rise * 1.3 + uSeed)));
    float x = vUv.x - 0.5 + (q.x - 0.5) * 0.45 * y + sin(y * 4.0 - t * 0.6 + uSeed * 3.0) * 0.035 * y;
    // It leaves the whole coffee surface (as wide as the cup's mouth) and spreads out as it rises
    float halfWidth = mix(0.3, 0.5, y);
    float mouth = 1.0 - smoothstep(halfWidth * 0.35, halfWidth, abs(x));
    // Soft wisps (low frequency, stretched upward, gentle thresholds) rather than crisp strands; they widen and blur
    // with height
    float wisps = fbm(vec2(x * 4.5 / (0.6 + y * 1.2), rise * 2.2) + q * 1.8);
    float soft = mix(0.16, 0.34, y);
    float density = mouth * smoothstep(0.5 - soft, 0.5 + soft, wisps);
    // Higher up it breaks into drifting patches and thins out
    float breakup = fbm(vec2(x * 2.2 + q.y, rise * 1.5) + 5.0);
    density *= mix(1.0, smoothstep(0.25, 0.75, breakup), y);
    density *= smoothstep(0.0, 0.14, y) * (1.0 - smoothstep(0.35, 1.0, y)) * mix(1.0, 0.6, y);
    gl_FragColor = vec4(vec3(0.95, 0.92, 0.88), density * uOpacity);
  }
`;

/**
 * A photographic studio for reflections: a near-black room with softbox panels (a big warm key upper-left, a tall
 * rim strip behind-right, a long overhead light), baked into an environment map.
 */
const studioEnvironment = (renderer) => {
  const room = new THREE.Scene();
  room.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshBasicMaterial({ color: '#0a0908', side: THREE.BackSide }),
    ),
  );
  const panel = (w, h, color, strength, position) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide }),
    );
    m.position.set(...position);
    m.lookAt(0, 0.4, 0);
    room.add(m);
  };
  panel(7, 5, '#ffe1c2', 7, [-6, 6, 5]); // key softbox
  panel(1.4, 9, '#f2e5d6', 5, [7, 3, -6]); // rim strip
  panel(9, 1.2, '#fff6ee', 2.2, [0, 10, 0]); // overhead
  panel(5, 3, '#d9c8b6', 0.6, [5, 1, 7]); // faint fill card
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.02);
  room.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  return { texture: target.texture, pmrem };
};

/**
 * One overflow drip: a bead of coffee that starts on top of the rim, rolls over the rounded lip and runs down the
 * outside of the cup to `endY`. Its cross-section is rounded (thickest in the middle, thinning to nothing at the
 * edges) and it hugs the surface, so it reads as liquid on the cup rather than a strip standing off it. It's wider at
 * the top, wobbles slightly, and is built row by row so setDrawRange can reveal it from the rim down. Returns the
 * geometry, its index count per segment, the path of its centre line (for the drop at its front) and how many rows
 * belong to the lip.
 */
const DRIP_ACROSS = 7; // vertices across the bead
const LIP_ROWS = 8;
const dripGeometry = (angle, width, endY, seed) => {
  const WALL_ROWS = 40;
  const positions = [];
  const colors = [];
  const centre = [];
  const row = (k, radial, y, nx, ny, w, a) => {
    // (radial, y) is a point on the cup's surface in its profile, (nx, ny) the surface normal there
    const half = w / 2 / Math.max(radial, 0.01);
    for (let v = 0; v < DRIP_ACROSS; v += 1) {
      const u = (v / (DRIP_ACROSS - 1)) * 2 - 1;
      const lift = 0.0012 + 0.0055 * Math.sqrt(1 - u * u);
      const r = radial + nx * lift;
      positions.push(Math.cos(a + u * half) * r, y + ny * lift, Math.sin(a + u * half) * r);
      // Thickness shading: light passes through the thin edges (lighter, amber), the thick middle is darker
      const thick = Math.sqrt(1 - u * u);
      colors.push(1.22 - 0.5 * thick, 1.18 - 0.48 * thick, 1.14 - 0.46 * thick);
    }
    const lift = 0.0067;
    centre[k] = new THREE.Vector3(
      Math.cos(a) * (radial + nx * lift),
      y + ny * lift,
      Math.sin(a) * (radial + nx * lift),
    );
  };
  // Over the lip: from its top to its outer side, following the half-round
  for (let k = 0; k < LIP_ROWS; k += 1) {
    const phi = Math.PI / 2 - (k / LIP_ROWS) * (Math.PI / 2);
    row(k, LIP_MID + Math.cos(phi) * LIP, LIP_Y + Math.sin(phi) * LIP, Math.cos(phi), Math.sin(phi), width, angle);
  }
  // Down the wall (the wall leans out slightly, so its normal tips down a touch)
  const slope = (R_RIM - R_BASE) / CUP_H;
  const nLen = Math.hypot(1, slope);
  for (let k = 0; k <= WALL_ROWS; k += 1) {
    const t = k / WALL_ROWS;
    const y = LIP_Y - t * (LIP_Y - endY);
    const a = angle + Math.sin(t * 9 + seed) * 0.018;
    const w = width * (1 - 0.35 * t) * (0.85 + 0.15 * Math.sin(t * 13 + seed * 2));
    row(LIP_ROWS + k, outerRadiusAt(y), y, 1 / nLen, -slope / nLen, w, a);
  }
  const rows = LIP_ROWS + WALL_ROWS + 1;
  const index = [];
  for (let k = 0; k < rows - 1; k += 1) {
    for (let v = 0; v < DRIP_ACROSS - 1; v += 1) {
      const i = k * DRIP_ACROSS + v;
      const j = i + DRIP_ACROSS;
      index.push(i, j, i + 1, i + 1, j, j + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return { geo, perSegment: (DRIP_ACROSS - 1) * 6, segments: rows - 1, centre, lipRows: LIP_ROWS };
};

/** The low dome of coffee swelling over the rim, with the crema projected flat from above (a sphere's own UVs pinch
 * the texture's dark edge into a blob at the pole). */
const swellGeometry = () => {
  const geo = new THREE.SphereGeometry(1, 96, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i += 1) uv.setXY(i, pos.getX(i) * 0.5 + 0.5, 0.5 - pos.getZ(i) * 0.5);
  return geo;
};

export const createCoffeeScene = (canvas, { getProgress, onReady, frameEl }) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // AgX: a filmic, photographic response (soft highlight roll-off, natural colour)
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(INK);
  const studio = studioEnvironment(renderer);
  scene.environment = studio.texture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50);

  // Direct lights for shadow and shape: a warm key (casts the soft shadow) and a rim from behind
  const key = new THREE.DirectionalLight('#ffd9b3', 2.4);
  key.position.set(-2.6, 4.2, 1.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 1, far: 10 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  // Rim from behind (stronger backlights were tried: they glared across the glossy saucer and table)
  const rim = new THREE.DirectionalLight('#e8d6c3', 1.6);
  rim.position.set(2.2, 2.2, -3.2);
  scene.add(rim);

  const glazeNoise = noiseTexture(128, 40, 6);
  const fineNoise = noiseTexture(128, 70, 10);

  const cup = new THREE.Group();
  scene.add(cup);

  // Ceramic cup: one lathe with a foot ring, the outer wall, a rounded rim and the inner wall down to the floor
  const profile = [
    new THREE.Vector2(0, 0.012),
    new THREE.Vector2(R_BASE - 0.05, 0.012),
    new THREE.Vector2(R_BASE - 0.04, 0),
    new THREE.Vector2(R_BASE - 0.012, 0),
    new THREE.Vector2(R_BASE, 0.014),
  ];
  // The rim is a true half-round lip (as wide as the wall), starting exactly where the outer wall ends and landing
  // exactly on the inner wall, so the walls flow into it without a step or ridge
  for (let k = 1; k <= 14; k += 1) {
    const y = 0.014 + ((LIP_Y - 0.014) * k) / 14;
    profile.push(new THREE.Vector2(outerRadiusAt(y), y));
  }
  for (let k = 1; k < 24; k += 1) {
    const a = (k / 24) * Math.PI;
    profile.push(new THREE.Vector2(LIP_MID + Math.cos(a) * LIP, LIP_Y + Math.sin(a) * LIP));
  }
  for (let k = 14; k >= 0; k -= 1) {
    const y = FLOOR + ((LIP_Y - FLOOR) * k) / 14;
    profile.push(new THREE.Vector2(innerRadiusAt(y), y));
  }
  profile.push(new THREE.Vector2(0, FLOOR));
  // Glaze: a satin body under a glossy clear coat, with faint roughness and bump variation like real ceramic
  const ceramic = new THREE.MeshPhysicalMaterial({
    color: GLAZE,
    roughness: 0.5,
    roughnessMap: glazeNoise,
    bumpMap: glazeNoise,
    bumpScale: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.25,
    sheenColor: new THREE.Color('#f3e7da'),
  });
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 160), ceramic);
  body.castShadow = true;
  body.receiveShadow = true;
  cup.add(body);

  // Handle: an ear-shaped tube whose ends sink into the (opaque) wall
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(outerRadiusAt(0.72) - 0.02, 0.72, 0),
    new THREE.Vector3(outerRadiusAt(0.72) + 0.16, 0.76, 0),
    new THREE.Vector3(outerRadiusAt(0.5) + 0.27, 0.56, 0),
    new THREE.Vector3(outerRadiusAt(0.32) + 0.2, 0.3, 0),
    new THREE.Vector3(outerRadiusAt(0.24) - 0.02, 0.24, 0),
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 80, 0.034, 20, false), ceramic);
  handle.scale.z = 0.82; // slightly flattened, like a real handle
  handle.castShadow = true;
  handle.receiveShadow = true;
  cup.add(handle);

  // Coffee: a column fitting inside the cup, clipped at the current level, under the crema
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), LEVEL_EMPTY);
  const coffee = new THREE.Mesh(
    new THREE.CylinderGeometry(
      innerRadiusAt(LEVEL_BRIM) - 0.004,
      innerRadiusAt(FLOOR) - 0.004,
      LEVEL_BRIM - FLOOR + 0.02,
      128,
      1,
      true,
    ),
    new THREE.MeshStandardMaterial({ color: COFFEE, roughness: 0.22, clippingPlanes: [clip] }),
  );
  coffee.position.y = FLOOR + (LEVEL_BRIM - FLOOR + 0.02) / 2;
  cup.add(coffee);

  const { map: cremaMap, bump: cremaBump } = cremaTextures();
  const cremaMat = new THREE.MeshStandardMaterial({
    map: cremaMap,
    roughness: 0.85,
    bumpMap: cremaBump,
    bumpScale: 1.6,
  });
  const crema = new THREE.Mesh(new THREE.CircleGeometry(1, 160), cremaMat);
  crema.rotation.x = -Math.PI / 2;
  crema.receiveShadow = true;
  cup.add(crema);
  // Meniscus: where the coffee meets the wall the crema climbs it in a thin, slightly lighter curve, instead of
  // stopping in a hard line
  const meniscus = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        [0.9, 0],
        [0.96, 0.0015],
        [0.99, 0.005],
        [1.0, 0.011],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      160,
    ),
    new THREE.MeshStandardMaterial({
      color: '#7d6858',
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
  );
  cup.add(meniscus);
  const swell = new THREE.Mesh(swellGeometry(), cremaMat);
  swell.position.y = CUP_H - 0.004;
  swell.visible = false;
  cup.add(swell);

  // Pouring stream: thin and glossy
  const stream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.013, 1, 20),
    new THREE.MeshPhysicalMaterial({ ...LIQUID_LOOK, color: LIQUID }),
  );
  cup.add(stream);
  const STREAM_TOP = 3.4;

  // Saucer: a shallow glossy plate with a raised rim and a well for the cup
  const saucerProfile = [
    [0, -0.04],
    [0.62, -0.04],
    [0.76, 0.0],
    [0.8, 0.045],
    [0.775, 0.052],
    [0.62, 0.014],
    [0.42, -0.002],
    [0.38, -0.008],
    [0, -0.008],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const saucer = new THREE.Mesh(
    new THREE.LatheGeometry(saucerProfile, 160),
    new THREE.MeshPhysicalMaterial({
      color: SAUCER,
      roughness: 0.35,
      roughnessMap: glazeNoise,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );
  saucer.position.y = -0.002;
  saucer.castShadow = true;
  saucer.receiveShadow = true;
  scene.add(saucer);

  // Tabletop: dark, slightly rough, catching the soft shadow and fading out into the page
  const table = new THREE.Mesh(
    new THREE.CircleGeometry(4, 96),
    new THREE.MeshStandardMaterial({
      color: '#1b1816',
      roughness: 0.62,
      roughnessMap: fineNoise,
      alphaMap: fadeTexture(),
      transparent: true,
      depthWrite: false,
    }),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = TABLE_Y;
  table.receiveShadow = true;
  scene.add(table);

  // Overflow drips: films running down the outside of the cup, some stopping part-way, each led by a drop
  const spillMat = new THREE.MeshPhysicalMaterial({ ...LIQUID_LOOK, color: LIQUID, side: THREE.DoubleSide });
  // The films carry thickness shading in vertex colours, over a lighter base
  const dripMat = new THREE.MeshPhysicalMaterial({
    ...LIQUID_LOOK,
    color: LIQUID_LIGHT,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  const drips = [
    [0.15, 0.1, 0.0],
    [0.95, 0.07, 0.42],
    [1.7, 0.12, 0.0],
    [2.6, 0.08, 0.3],
    [3.4, 0.11, 0.0],
    [4.3, 0.06, 0.55],
    [5.3, 0.1, 0.0],
  ].map(([angle, width, endY], i) => {
    const d = dripGeometry(angle, width, endY, i * 1.7);
    d.geo.setDrawRange(0, 0);
    const film = new THREE.Mesh(d.geo, dripMat);
    film.castShadow = true;
    cup.add(film);
    const drop = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), spillMat);
    drop.scale.set(width * 0.42, width * 0.5, width * 0.14); // wide enough to round off the front of its film
    drop.userData.size = drop.scale.clone();
    drop.rotation.y = Math.PI / 2 - angle;
    drop.visible = false;
    cup.add(drop);
    // Each drip runs at its own pace, so they don't move in lockstep
    // Viscous: about 2 s from the rim to the saucer
    return { ...d, drop, endY, delay: (i % 4) * 0.2, duration: 1.8 + ((i * 5) % 3) * 0.3 };
  });

  // Overflow sheet: coffee running over the whole rim in many uneven rivulets (a film around the cup whose alpha map
  // holds the rivulets: a band at the lip and streaks of varied width and length, each ending in a bead). The map
  // slides down the cup, so the rivulets flow out from the rim; alphaTest keeps their edges crisp.
  const sheetProfile = [];
  for (let k = 0; k <= 30; k += 1) {
    const y = 0.012 + ((LIP_Y - 0.012) * k) / 30;
    sheetProfile.push(new THREE.Vector2(outerRadiusAt(y) + 0.0015, y));
  }
  for (let k = 1; k <= 8; k += 1) {
    const phi = (k / 8) * (Math.PI / 2);
    sheetProfile.push(
      new THREE.Vector2(LIP_MID + Math.cos(phi) * (LIP + 0.0015), LIP_Y + Math.sin(phi) * (LIP + 0.0015)),
    );
  }
  const { tex: rivulets, shade: rivuletShade } = rivuletTexture();
  const sheet = new THREE.Mesh(
    new THREE.LatheGeometry(sheetProfile, 200),
    new THREE.MeshPhysicalMaterial({
      ...LIQUID_LOOK,
      color: LIQUID_LIGHT,
      map: rivuletShade,
      alphaMap: rivulets,
      alphaTest: 0.5,
    }),
  );
  sheet.receiveShadow = true;
  sheet.visible = false;
  cup.add(sheet);

  // Pool: an uneven glossy puddle spreading from the cup's base across the saucer
  const poolGeo = new THREE.CircleGeometry(1, 160);
  const poolPos = poolGeo.attributes.position;
  for (let i = 1; i < poolPos.count; i += 1) {
    const a = Math.atan2(poolPos.getY(i), poolPos.getX(i));
    const wobble = 1 + 0.04 * Math.sin(a * 3 + 0.6) + 0.02 * Math.sin(a * 7 + 1.9) + 0.012 * Math.sin(a * 13);
    poolPos.setXY(i, poolPos.getX(i) * wobble, poolPos.getY(i) * wobble);
  }
  const pool = new THREE.Mesh(
    poolGeo,
    // The same coffee as the drips. It faces the overhead light while the drips face sideways, so its base colour is
    // darker to look the same on screen (a deeper puddle reads darker too).
    Object.assign(spillMat.clone(), {
      color: new THREE.Color(LIQUID).multiplyScalar(0.3),
      clearcoat: 0.5,
      roughness: 0.3,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -0.006;
  pool.receiveShadow = true;
  pool.visible = false;
  // The pool only starts once the first drip running all the way down reaches the saucer (its drop is there by 90%
  // of its run), measured on the same clock as the drips
  const POOL_START = Math.min(...drips.filter((d) => d.endY === 0).map((d) => d.delay + d.duration * 0.9));
  scene.add(pool);

  // Steam: two crossed wisp planes (different seeds) for some volume; they turn to face the camera around the
  // vertical axis
  const wisps = [0, 1].map((seed) => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.4),
      new THREE.ShaderMaterial({
        vertexShader: STEAM_VERTEX,
        fragmentShader: STEAM_FRAGMENT,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uSeed: { value: seed * 0.61 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    scene.add(plane);
    return { plane, seed };
  });

  // Post-processing: a gentle depth of field. (Ambient occlusion was tried: it drew the steam sprites as dark blocks,
  // and the shadow map already grounds the cup.)
  // Rendering through the composer skips the canvas's built-in antialiasing, so its target is multisampled (the cup's
  // rim and edges looked jagged and flickered as it turned)
  const composer = new EffectComposer(
    renderer,
    new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }),
  );
  composer.setPixelRatio(pixelRatio);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 3.6, aperture: 0.0012, maxblur: 0.006 });
  composer.addPass(bokeh);
  composer.addPass(new OutputPass());

  // Size
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    // Keep the cup a similar size on narrow (portrait) screens
    camera.fov = w / h < 0.8 ? 62 : 32;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // Finale state
  let finaleStart = null;
  let onFinaleDone = null;
  let finished = false;

  const target = new THREE.Vector3(0, CUP_H * 0.42, 0);

  // The loader's Figma-style selection frame tracks the cup and saucer on screen: project points around the real
  // outlines (saucer rim, cup base and rim, handle) and size the overlay to them (straight to its style).
  const outline = [];
  for (const [r, y] of [
    [0.8, 0.05],
    [0.8, -0.04],
    [R_BASE, 0],
    [R_RIM, CUP_H + 0.01],
    [outerRadiusAt(0.5) + 0.31, 0.56],
  ]) {
    for (let k = 0; k < 24; k += 1) {
      const a = (k / 24) * Math.PI * 2;
      outline.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
    }
  }
  const projected = new THREE.Vector3();
  const placeFrame = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const c of outline) {
      projected.copy(c).project(camera);
      const px = ((projected.x + 1) / 2) * w;
      const py = ((1 - projected.y) / 2) * h;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
    const pad = 18;
    frameEl.style.left = `${minX - pad}px`;
    frameEl.style.top = `${minY - pad}px`;
    frameEl.style.width = `${maxX - minX + pad * 2}px`;
    frameEl.style.height = `${maxY - minY + pad * 2}px`;
  };

  const lookAt = new THREE.Vector3();
  const surface = new THREE.Vector3();
  const start = performance.now();
  let frame = 0;
  let shownAt = null;
  let warmFrames = 0;
  let lastNow = performance.now();
  let steam = 0;
  // Compile every material up front, so the first visible frame doesn't stall while shaders build
  renderer.compile(scene, camera);

  const render = (now) => {
    frame = requestAnimationFrame(render);
    const t = (now - start) / 1000;
    const fill = clamp01(getProgress() / 100);
    const f = finaleStart === null ? 0 : (now - finaleStart) / 1000;

    // Phases of the finale (seconds)
    // Paced like real coffee: it takes its time to crawl over the rim and run down, and the saucer fills slowly
    // One continuous overflow motion (eased only at its very start and end): the coffee rises to the brim, the
    // surface domes up and creeps out over the rim, each stage overlapping the next so it never pauses
    const flow = ease(clamp01(f / OVERFLOW_TIME));
    const rise = clamp01(flow / 0.4); // coffee rises to the brim
    const spill = Math.max(0, f - SPILL_AT); // seconds since the coffee started over the rim
    const swoop = ease(clamp01((f - SWOOP_AT) / 1.0)); // camera rises over the cup
    const dive = ease(clamp01((f - DIVE_AT) / 0.65)); // camera dives into the coffee

    // Coffee level and crema
    const level = LEVEL_EMPTY + (LEVEL_FULL - LEVEL_EMPTY) * fill + (LEVEL_BRIM - LEVEL_FULL) * rise;
    clip.constant = level;
    crema.scale.setScalar(Math.min(innerRadiusAt(level), R_RIM - WALL));
    crema.position.y = level;
    crema.rotation.z = t * 0.2;
    const edge = Math.min(innerRadiusAt(level), R_RIM - WALL) - 0.001;
    meniscus.scale.set(edge, 1, edge);
    meniscus.position.y = level + 0.0008; // just above the crema (a depth offset made it show through the wall)
    meniscus.visible = rise < 0.98;
    // At the brim the flat surface hands over seamlessly to a dome of the same size and height, which first bulges up
    // inside the mouth (surface tension holding it back), then slowly creeps out across the rim until it's a little
    // wider than the lip, so the drips run out from under it
    swell.visible = rise >= 1;
    crema.visible = !swell.visible;
    const bulge = clamp01((flow - 0.4) / 0.4);
    const creep = clamp01((flow - 0.55) / 0.45);
    const domeR = R_RIM - WALL + (WALL + 0.006) * creep;
    swell.scale.set(domeR, 0.01 + 0.014 * bulge + 0.006 * creep, domeR);
    swell.rotation.y = t * 0.2;

    // Stream: falls in at the start, pours while filling, stops at 100%
    const pourIn = clamp01(t / 0.5);
    // At 100% the pour is cut off at the top and its tail falls into the cup, instead of the stream just thinning out
    // (it keeps pouring a moment into the overflow, which is what pushes the coffee over the rim)
    const cut = finaleStart === null ? 0 : clamp01((f - 1.3) / 0.5);
    const streamBottom = STREAM_TOP - (STREAM_TOP - level) * (pourIn * pourIn);
    const streamTop = STREAM_TOP - (STREAM_TOP - level) * cut * cut;
    stream.visible = streamTop - streamBottom > 0.005;
    stream.scale.set(1, Math.max(streamTop - streamBottom, 0.001), 1);
    stream.position.set(Math.sin(t * 6) * 0.003, (streamTop + streamBottom) / 2, 0);

    // Overflow: each film is revealed from the rim down, led by its drop (once it's running)
    drips.forEach(({ geo, perSegment, segments, centre, drop, delay, duration }) => {
      const p = clamp01((spill - delay) / duration);
      // The drop glides between the film's points (no stepping); the film is drawn just past it
      const run = segments * ease(p);
      const k = Math.min(Math.floor(run), segments - 1);
      geo.setDrawRange(0, Math.min(Math.ceil(run), segments) * perSegment);
      // The drop gathers on the outer side of the lip and swells in as the drip reaches the wall (never on top of
      // the rim, where it stuck up like an ear, and never popping in)
      const gather = clamp01((run - (LIP_ROWS - 3)) / 5);
      const swellIn = gather * gather * (3 - 2 * gather);
      drop.visible = swellIn > 0.01;
      if (drop.visible) {
        drop.position.lerpVectors(centre[k], centre[k + 1], run - k);
        drop.scale.copy(drop.userData.size).multiplyScalar(swellIn);
      }
    });
    // The sheet's rivulets flow down from the rim (gravity: slow to start, then running)
    const sheetRun = clamp01((f - SPILL_AT - 0.1) / 2.3);
    sheet.visible = sheetRun > 0;
    rivuletShade.offset.y = rivulets.offset.y = -(1 - sheetRun * sheetRun * (3 - 2 * sheetRun));
    // The pool starts as the first drips reach the saucer and spreads out, slowing as it widens
    // It grows out from under the cup's base (hidden there at first) and keeps spreading through the swoop
    const spread = easeOut(clamp01((spill - POOL_START) / 1.8));
    pool.visible = spread > 0.001;
    // The saucer fills: the pool widens and its surface rises, so its edge meets the saucer's sloping floor
    pool.scale.setScalar(R_BASE - 0.01 + spread * 0.31);
    pool.position.y = -0.006 + spread * 0.018;

    // Steam
    // It eases in over a couple of seconds once the cup is half full (not tied to the count, which can jump) and
    // eases out as the camera swoops
    const dt = Math.min((now - lastNow) / 1000, 0.1);
    lastNow = now;
    steam += ((fill > 0.5 ? 1 : 0) - steam) * Math.min(1, dt * 0.9);
    const steamOn = steam * steam * (1 - swoop);
    wisps.forEach(({ plane, seed }) => {
      // Its base sits on the coffee surface (the front wall hides it while the level is below the rim)
      plane.position.set((seed - 0.5) * 0.04, level + 0.7, (seed - 0.5) * 0.04);
      plane.lookAt(camera.position.x, plane.position.y, camera.position.z);
      plane.rotateY(seed * 0.5);
      plane.material.uniforms.uTime.value = t;
      plane.material.uniforms.uOpacity.value = steamOn * 0.42;
    });

    // Camera: a held three-quarter view with a gentle drift while the cup turns (a turntable product reveal); then
    // it swoops up over the cup and dives straight down into the coffee
    const az = 0.62 + Math.sin(t * 0.35) * 0.12;
    cup.rotation.y = t * 0.32;
    const intro = shownAt === null ? 0 : ease(clamp01((now - shownAt) / 1400));
    const dist = 4.5 - 0.9 * intro;
    const orbit = new THREE.Vector3(
      Math.sin(az) * dist,
      2.05 + 0.3 * (1 - intro) + Math.sin(t * 0.6) * 0.03,
      Math.cos(az) * dist,
    );
    const above = new THREE.Vector3(Math.sin(az) * 0.02, 2.4, Math.cos(az) * 0.02);
    const inside = new THREE.Vector3(0, level - 0.05, 0.0001);
    camera.position.copy(orbit.lerp(above, swoop).lerp(inside, dive));
    surface.set(0, level, 0);
    lookAt.copy(target).lerp(surface, Math.max(swoop, dive));
    camera.lookAt(lookAt);
    // Keep the depth of field focused on what the camera is looking at
    bokeh.uniforms.focus.value = camera.position.distanceTo(lookAt);

    composer.render();
    if (frameEl) placeFrame();
    // Report ready only after a few real frames, so shader builds and the first-frame hitches are over before the
    // canvas fades in; the intro dolly starts from there
    warmFrames += 1;
    if (shownAt === null && warmFrames >= 4) {
      shownAt = now;
      onReady?.();
    }

    if (finaleStart !== null && !finished && f >= FINALE_END) {
      finished = true;
      onFinaleDone?.();
    }
  };
  frame = requestAnimationFrame(render);

  return {
    finale(done) {
      onFinaleDone = done;
      finaleStart = performance.now();
    },
    dispose() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      [cremaMap, cremaBump, glazeNoise, fineNoise, rivulets, rivuletShade, table.material.alphaMap].forEach((tex) =>
        tex.dispose(),
      );
      composer.dispose();
      studio.texture.dispose();
      studio.pmrem.dispose();
      renderer.dispose();
    },
  };
};
