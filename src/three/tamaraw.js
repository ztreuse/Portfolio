import {
  CanvasTexture,
  Color,
  InstancedBufferAttribute,
  Mesh,
  MeshBasicNodeMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  WebGPURenderer,
} from 'three/webgpu';
import {
  cos,
  float,
  instancedBufferAttribute,
  length,
  mix,
  positionGeometry,
  sin,
  smoothstep,
  step,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import logoUrl from '../assets/images/feu-tamaraw.png';

/*
 * The hero photo's hidden turn: hold it and it breaks into particles that gather into the FEU Tech tamaraw (the owner's
 * school mascot, cut out of its artwork in assets/images/feu-tamaraw.png); let go and they flow back. Written in TSL
 * (Three.js's shading language), so it runs on WebGPU and falls back to WebGL2.
 *
 * Every particle is a small tile of the photo. At rest the tiles lie edge to edge and redraw the photo exactly, so the
 * swap from the real <img> can't be seen. On its way a tile shrinks into a dot and takes its place and colour on the
 * logo, which sways gently from side to side, showing near-black sides as it turns, like a thick, solid badge.
 */
const CELL = 1.9; // CSS px: a tile's size (finer than the coffee's 2.2, so the logo's thin circuit lines keep their detail)
const HOLD_TIME = 1.9; // s to become the logo
const BACK_TIME = 1.2; // s to flow back
const SPREAD = 0.45; // how much later the tiles furthest from the press set off
const SWAY = 0.42; // rad, how far it turns each way
const SWAY_SPEED = 0.7; // rad/s of the sway's own clock
// Its thickness: dark layers behind the logo's edges (only the edges: behind the face nothing else can show), so as it
// sways it shows black sides like a solid badge (the owner's request)
const DEPTH = 0.075; // of the logo's half height
const LAYERS = 9; // dense enough that the side reads as one wall at the widest turn

const between = (a, b) => a + Math.random() * (b - a);

/** The logo's pixels: which are solid, and their linear colours. */
const readLogo = async () => {
  const img = new Image();
  img.src = logoUrl;
  await img.decode();
  const [w, h] = [img.naturalWidth, img.naturalHeight];
  const canvas = document.createElement('canvas');
  [canvas.width, canvas.height] = [w, h];
  const g = canvas.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, w, h);
  const colours = new Float32Array(w * h * 3);
  const solid = [];
  const colour = new Color();
  for (let p = 0; p < w * h; p += 1) {
    if (data[p * 4 + 3] < 200) continue;
    solid.push(p);
    colour.setRGB(data[p * 4] / 255, data[p * 4 + 1] / 255, data[p * 4 + 2] / 255, SRGBColorSpace);
    colours.set(colour.toArray(), p * 3);
  }
  return {
    w,
    h,
    colours,
    solid,
    isSolid: (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= 200,
  };
};

/**
 * `count` places on the logo (-1..1 tall, centred), each with its pixel's colour. They sit on an even grid spaced so
 * that about `count` of its points fall inside the logo (at random they'd clump and leave gaps, and the edges would
 * fray), any left over go to random solid pixels.
 */
const logoPlaces = ({ w, h, colours, solid, isSolid }, count) => {
  const step = Math.sqrt(solid.length / count); // logo px between neighbours
  const half = h / 2;
  const places = [];
  const put = (x, y, p) =>
    places.push({
      at: [(x - w / 2) / half, (half - y) / half, 0],
      colour: colours.subarray(p * 3, p * 3 + 3),
    });
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const [px, py] = [Math.floor(x), Math.floor(y)];
      if (isSolid(px, py)) put(x, y, py * w + px);
    }
  }
  while (places.length > count) {
    places[Math.floor(Math.random() * places.length)] = places[places.length - 1];
    places.pop();
  }
  while (places.length < count) {
    const p = solid[Math.floor(Math.random() * solid.length)];
    put((p % w) + Math.random(), Math.floor(p / w) + Math.random(), p);
  }
  return { places, step };
};

/** The grid points (same spacing as the places) on the logo's edges: where any neighbour is empty. */
const edgePlaces = ({ w, h, colours, isSolid }, step) => {
  const half = h / 2;
  const edges = [];
  const reach = Math.max(1, Math.round(step));
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const [px, py] = [Math.floor(x), Math.floor(y)];
      if (!isSolid(px, py)) continue;
      // Any empty neighbour, sideways, up, down or diagonal: with only sideways ones, the gently sloping edges (the tops
      // of the horns and ears) got a dashed side
      const open = [-reach, 0, reach].some((dx) => [-reach, 0, reach].some((dy) => !isSolid(px + dx, py + dy)));
      if (open)
        edges.push({
          at: [(x - w / 2) / half, (half - y) / half],
          colour: colours.subarray((py * w + px) * 3, (py * w + px) * 3 + 3),
        });
    }
  }
  return edges;
};

/** The photo cropped exactly as the <img> shows it (object-fit: cover), rounded like its frame. */
const cropped = (image, w, h, scale) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const g = canvas.getContext('2d');
  const [px, py] = getComputedStyle(image)
    .objectPosition.split(' ')
    .map((v) => parseFloat(v) / 100);
  const fit = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
  const [dw, dh] = [image.naturalWidth * fit, image.naturalHeight * fit];
  g.beginPath();
  g.roundRect(0, 0, canvas.width, canvas.height, parseFloat(getComputedStyle(image).borderRadius) * scale || 0);
  g.clip();
  g.imageSmoothingQuality = 'high';
  g.drawImage(image, (canvas.width - dw) * px, (canvas.height - dh) * py, dw, dh);
  const map = new CanvasTexture(canvas);
  map.colorSpace = SRGBColorSpace;
  map.generateMipmaps = false;
  return map;
};

/**
 * Draws on `canvas`, which overhangs the photo's box by `pad` px on every side so the particles can fly past the frame.
 * `onStart` runs once the particles cover the photo (hide the <img>), `onRest` just before they go (show it again).
 */
export const createTamaraw = async ({ canvas, image, pad, onStart, onRest }) => {
  const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: false });
  const [logo] = await Promise.all([readLogo(), renderer.init()]);
  renderer.setClearColor(0x000000, 0);
  // The dots are cut out in the shader, so draw a bit finer than the screen to keep their edges soft
  const ratio = Math.min(2, Math.max(1.5, window.devicePixelRatio));
  renderer.setPixelRatio(ratio);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
  const progress = uniform(0);
  const turn = uniform(0);
  const clock = uniform(0);
  const pressX = uniform(0);
  const pressY = uniform(0);

  let mesh = null;
  let sides = null;
  let box = [0, 0];

  const build = () => {
    const [w, h] = [image.clientWidth, image.clientHeight];
    if (mesh && box[0] === w && box[1] === h) return;
    box = [w, h];
    if (mesh) {
      scene.remove(mesh, sides);
      mesh.geometry.dispose();
      mesh.material.dispose();
      mesh.userData.map.dispose();
      sides.geometry.dispose();
      sides.material.dispose();
    }
    const [W, H] = [w + pad * 2, h + pad * 2];
    renderer.setSize(W, H, false);
    Object.assign(camera, { left: -W / 2, right: W / 2, top: H / 2, bottom: -H / 2 });
    camera.updateProjectionMatrix();

    const cols = Math.round(w / CELL);
    const rows = Math.round(h / CELL);
    const count = cols * rows;
    const cell = [w / cols, h / rows];

    // Places on the logo, from the bottom up (roughly), so the photo's foot becomes the muzzle
    const { places: spots, step: gap } = logoPlaces(logo, count);
    const places = spots
      .map((p) => ({ ...p, order: p.at[1] + between(-0.25, 0.25) }))
      .sort((a, b) => a.order - b.order);

    const home = new Float32Array(count * 2);
    const target = new Float32Array(count * 3);
    const tint = new Float32Array(count * 3);
    const chance = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) {
      const row = Math.floor(i / cols);
      home.set([((i % cols) + 0.5) * cell[0] - w / 2, (row + 0.5) * cell[1] - h / 2], i * 2);
      target.set(places[i].at, i * 3);
      tint.set(places[i].colour, i * 3);
      chance.set([Math.random(), Math.random()], i * 2);
    }

    const aHome = instancedBufferAttribute(new InstancedBufferAttribute(home, 2));
    const aTarget = instancedBufferAttribute(new InstancedBufferAttribute(target, 3));
    const aTint = instancedBufferAttribute(new InstancedBufferAttribute(tint, 3));
    const aChance = instancedBufferAttribute(new InstancedBufferAttribute(chance, 2));

    // Each tile's own progress: it sets off as a wave spreading from the press reaches it
    const landing = (from, chance) =>
      smoothstep(
        0,
        1,
        progress
          .mul(1 + SPREAD + 0.15)
          .sub(
            length(from.sub(vec2(pressX, pressY)))
              .div(Math.hypot(w, h))
              .mul(SPREAD)
              .add(chance.mul(0.15)),
          )
          .clamp(0, 1),
      );
    const e = landing(aHome, aChance.x);

    // Its place on the logo: turned (the sway), with a hint of perspective
    const unit = Math.min((h + pad) * 0.48, w * 0.62); // may reach past the frame a little (the canvas overhangs it)
    const [c, s] = [cos(turn), sin(turn)];
    const rx = aTarget.x.mul(c).add(aTarget.z.mul(s));
    const rz = aTarget.z.mul(c).sub(aTarget.x.mul(s));
    const near = float(1).add(rz.mul(0.12));
    const there = vec3(rx.mul(near), aTarget.y.mul(near), rz).mul(unit);

    // On the way it swings out in a loose swirl
    const swing = sin(e.mul(Math.PI));
    const angle = aChance.y.mul(Math.PI * 2).add(e.mul(4));
    const drift = vec3(cos(angle), sin(angle), sin(angle.mul(1.7)))
      .mul(swing)
      .mul(aChance.x.mul(0.8).add(0.2))
      .mul(pad * 0.9);
    const centre = mix(vec3(aHome, 0), there, e).add(drift);

    // In flight a round dot; landed, a square exactly one grid cell wide, so the squares tile edge to edge and redraw the
    // logo like a crisp image (round dots bigger than the gap blurred its thin circuit lines)
    const square = (gap * unit) / (logo.h / 2) + 0.35;
    const dot = mix(float(square), aChance.y.mul(0.8).add(2.4), swing);
    const size = mix(vec2(cell[0], cell[1]), vec2(dot), smoothstep(0, 0.4, e));

    const material = new MeshBasicNodeMaterial();
    material.positionNode = centre.add(vec3(positionGeometry.xy.mul(size), 0));

    // The logo's own colours, a little dimmer the further it's turned, like a card catching less light
    const colour = aTint.mul(c.mul(0.3).add(0.7));

    const map = cropped(image, w, h, ratio);
    const tile = aHome.add(uv().sub(0.5).mul(vec2(cell[0], cell[1])));
    const photo = texture(map, tile.div(vec2(w, h)).add(0.5));
    material.colorNode = mix(photo.rgb, colour, smoothstep(0.2, 0.8, e));
    // A square tile at rest and on the logo, a round dot in between
    const corner = length(uv().sub(0.5));
    const dotMask = step(corner, mix(0.75, 0.5, swing.mul(2).clamp(0, 1)));
    material.opacityNode = dotMask.mul(mix(photo.a, 1, step(0.2, e)));
    material.alphaTest = 0.5;

    mesh = new Mesh(new PlaneGeometry(1, 1), material);
    mesh.count = count;
    mesh.frustumCulled = false;
    mesh.userData.map = map;

    // The sides: copies of the edge places stepped back in depth, drawn behind the face so only what sticks out past it
    // shows. Each grows in as the tile that lands in front of it arrives (it borrows that tile's start and timing), so
    // the badge's thickness builds up with the logo, spot by spot, and goes as they leave; never flying with the swarm
    const edges = edgePlaces(logo, gap);
    const tileAt = new Map(places.map((p, i) => [`${p.at[0]},${p.at[1]}`, i]));
    const sideFrom = new Float32Array(edges.length * LAYERS * 3);
    const depthOf = (k) => -DEPTH * ((k + 1) / LAYERS);
    const sideAt = new Float32Array(edges.length * LAYERS * 4);
    const sideTint = new Float32Array(edges.length * LAYERS * 3);
    edges.forEach(({ at: [x, y], colour: edgeColour }, i) => {
      const t = tileAt.get(`${x},${y}`) ?? Math.floor(Math.random() * count);
      for (let k = 0; k < LAYERS; k += 1) {
        sideFrom.set([home[t * 2], home[t * 2 + 1], chance[t * 2]], (i * LAYERS + k) * 3);
        sideAt.set([x, y, depthOf(k), k / (LAYERS - 1)], (i * LAYERS + k) * 4);
        sideTint.set(edgeColour, (i * LAYERS + k) * 3);
      }
    });
    const aSide = instancedBufferAttribute(new InstancedBufferAttribute(sideAt, 4));
    const aSideTint = instancedBufferAttribute(new InstancedBufferAttribute(sideTint, 3));
    const sx = aSide.x.mul(c).add(aSide.z.mul(s));
    const sz = aSide.z.mul(c).sub(aSide.x.mul(s));
    const sNear = float(1).add(sz.mul(0.12));
    const sideThere = vec3(sx.mul(sNear), aSide.y.mul(sNear), sz).mul(unit);
    const aSideFrom = instancedBufferAttribute(new InstancedBufferAttribute(sideFrom, 3));
    // Only in the last moment of its tile's landing, when that tile has all but settled into place: any earlier and the
    // black outline showed up ahead of the logo it belongs to
    const solidness = smoothstep(0.97, 1, landing(aSideFrom.xy, aSideFrom.z));
    const sideMaterial = new MeshBasicNodeMaterial();
    // A little larger than the face's tiles, so each row's bit of side merges into one smooth wall (at the face's size,
    // diagonal edges showed it as a stack of short streaks)
    sideMaterial.positionNode = sideThere.add(vec3(positionGeometry.xy.mul(float(square * 1.6).mul(solidness)), 0));
    // A very dark shade of the colour in front of it (near-black green behind the green, near-black gold behind the
    // gold), darkening further back: it reads as black on the light page and still shows on the dark one
    sideMaterial.colorNode = aSideTint.mul(mix(0.05, 0.018, aSide.w));
    sides = new Mesh(new PlaneGeometry(1, 1), sideMaterial);
    sides.count = edges.length * LAYERS;
    sides.frustumCulled = false;
    scene.add(sides, mesh);
  };

  let holding = false;
  let running = false;
  let shown = false;
  let last = 0;

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    progress.value = Math.min(1, Math.max(0, progress.value + (holding ? dt / HOLD_TIME : -dt / BACK_TIME)));
    clock.value += dt;
    turn.value = Math.sin(clock.value * SWAY_SPEED) * SWAY;
    renderer.render(scene, camera);
    if (!shown) {
      shown = true;
      onStart();
    }
    if (progress.value <= 0 && !holding) {
      running = false;
      shown = false;
      renderer.setAnimationLoop(null);
      onRest();
    }
  };

  return {
    /** Press at a point of the photo, from its top left corner. */
    hold(x, y) {
      holding = true;
      if (running) return;
      build();
      pressX.value = x - box[0] / 2;
      pressY.value = box[1] / 2 - y;
      clock.value = 0;
      running = true;
      last = performance.now();
      renderer.setAnimationLoop(frame);
    },
    release() {
      holding = false;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.dispose();
    },
  };
};
