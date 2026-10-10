import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// The photo is seen through a sheet of coffee. Ripple slopes (from the height map) bend the image; disturbed
// areas take a slight brown tint, crests catch a warm crema glint and troughs sink toward espresso. Everything the
// ripples do is scaled by uEnergy, which eases down to 0 as the waves die out, so the effect fades away smoothly
// instead of flickering on tiny leftover waves and then snapping flat. A slow sway keeps it alive when idle.
const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uWater;
uniform vec2 uTexel;
uniform vec2 uPixel; // one CSS pixel in uv units, so ripples bend the same distance on any screen
uniform vec2 uCover;
uniform float uTime;
uniform float uDim; // how far the photo is darkened toward the page ink (the coffee is drawn on top, undimmed)
uniform float uEnergy; // 1 while rippling, easing to 0 as it calms

void main() {
  float left = texture2D(uWater, vUv - vec2(uTexel.x, 0.0)).r;
  float right = texture2D(uWater, vUv + vec2(uTexel.x, 0.0)).r;
  float down = texture2D(uWater, vUv - vec2(0.0, uTexel.y)).r;
  float up = texture2D(uWater, vUv + vec2(0.0, uTexel.y)).r;
  vec2 slope = vec2(right - left, up - down);
  // Only the main ripple around the cursor shows: faint waves (spreading rings, gentle moves) are filtered out.
  slope *= smoothstep(0.004, 0.016, length(slope)) * uEnergy;

  vec2 offset = slope * 300.0 * uPixel;
  offset += vec2(sin(vUv.y * 4.0 + uTime * 0.3), cos(vUv.x * 3.0 + uTime * 0.25)) * 4.0 * uPixel;

  vec2 uv = (vUv - offset - 0.5) * uCover + 0.5;
  vec3 color = mix(texture2D(uImage, uv).rgb, vec3(0.086, 0.082, 0.075), uDim);

  // Coffee surface: a slight brown body where it's disturbed, crests glint crema, troughs sink toward espresso.
  float light = dot(slope, vec2(-1.0, 1.0)) * 3.0;
  color = mix(color, vec3(0.22, 0.15, 0.10), smoothstep(0.0, 0.5, abs(light)) * 0.3);
  color += vec3(0.79, 0.70, 0.60) * clamp(light, 0.0, 0.18);
  color = mix(color, vec3(0.05, 0.03, 0.02), clamp(-light, 0.0, 0.4));

  gl_FragColor = vec4(color, 1.0);
}`;

// Ripple cells are a fixed size in CSS pixels, so ripples look the same size on a phone as on a desktop.
const CELL_SIZE = 8;
const DAMPING = 0.95; // how quickly the ripples calm down (strong, so waves stay near the cursor)
const FULL_WAVE = 0.12; // wave height at which the effect is at full strength; smaller leftovers fade it out
// How quickly the effect strength follows the waves (per frame): up fast when you move, down gently as it calms.
const ENERGY_RISE = 0.5;
const ENERGY_FALL = 0.08;

const canUseFluid = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const createTexture = (gl) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
};

/**
 * Background image under a sheet of coffee: moving the cursor (or a finger) leaves a wake of ripples
 * that spread, bend the photo with a slight coffee-brown tint and fade smoothly away. It sways gently
 * when idle. Falls back to a plain <img> without WebGL or with reduced motion. `dim` (0–1) darkens the photo toward
 * the page ink inside the shader, so the coffee effects are drawn on top at full strength instead of under an overlay. Accepts the same motion props as motion.img.
 */
const FluidImage = ({ src, paused = false, dim = 0, ...props }) => {
  const canvasRef = useRef(null);
  const [enabled] = useState(canUseFluid);
  // `paused` stops the loop while the image is hidden (e.g. the pinned hero once About covers it).
  const activeRef = useRef(!paused);
  const wakeRef = useRef(null);

  useEffect(() => {
    activeRef.current = !paused;
    wakeRef.current?.();
  }, [paused]);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    // React StrictMode mounts twice in dev, so the context is reused rather than destroyed on cleanup.
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return undefined;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uCover = gl.getUniformLocation(program, 'uCover');
    const uTexel = gl.getUniformLocation(program, 'uTexel');
    const uPixel = gl.getUniformLocation(program, 'uPixel');
    const uTime = gl.getUniformLocation(program, 'uTime');
    gl.uniform1f(gl.getUniformLocation(program, 'uDim'), dim);
    const uEnergy = gl.getUniformLocation(program, 'uEnergy');
    gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'uWater'), 1);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    const imageTexture = createTexture(gl);
    const waterTexture = createTexture(gl);

    // Ripple height field (rows run bottom to top, matching texture coordinates).
    let cols = 2;
    let rows = 1;
    let current = new Float32Array(0);
    let previous = new Float32Array(0);
    let pixels = new Uint8Array(0);
    let energy = 0;
    let calm = true;

    let loaded = false;
    let imageAspect = 1;
    let frame = 0;
    let visible = true;
    let last = null;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const canvasAspect = canvas.width / canvas.height;
      // object-cover: crop whichever side of the image overflows.
      gl.uniform2f(
        uCover,
        canvasAspect > imageAspect ? 1 : canvasAspect / imageAspect,
        canvasAspect > imageAspect ? imageAspect / canvasAspect : 1,
      );

      cols = Math.max(2, Math.round(canvas.clientWidth / CELL_SIZE));
      rows = Math.max(2, Math.round(canvas.clientHeight / CELL_SIZE));
      current = new Float32Array(cols * rows);
      previous = new Float32Array(cols * rows);
      pixels = new Uint8Array(cols * rows).fill(128);
      gl.uniform2f(uTexel, 1 / cols, 1 / rows);
      gl.uniform2f(uPixel, 1 / Math.max(canvas.clientWidth, 1), 1 / Math.max(canvas.clientHeight, 1));
      calm = false;
    };

    const disturb = (x, y, amount) => {
      const cx = Math.round(x * (cols - 1));
      const cy = Math.round(y * (rows - 1));
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const gx = cx + dx;
          const gy = cy + dy;
          const reach = 1 - Math.hypot(dx, dy) / 3;
          if (reach > 0 && gx > 0 && gy > 0 && gx < cols - 1 && gy < rows - 1) {
            current[gy * cols + gx] += amount * reach;
          }
        }
      }
      calm = false;
    };

    // One step of the classic ripple equation; returns the strongest wave left.
    const step = () => {
      let peak = 0;
      for (let y = 1; y < rows - 1; y += 1) {
        for (let x = 1; x < cols - 1; x += 1) {
          const i = y * cols + x;
          const next =
            ((current[i - 1] + current[i + 1] + current[i - cols] + current[i + cols]) / 2 - previous[i]) * DAMPING;
          previous[i] = next;
          pixels[i] = Math.max(0, Math.min(255, 128 + next * 50));
          if (Math.abs(next) > peak) peak = Math.abs(next);
        }
      }
      [current, previous] = [previous, current];
      return peak;
    };

    const render = () => {
      frame = visible && activeRef.current ? requestAnimationFrame(render) : 0;
      if (!loaded) return;
      if (!calm) {
        // The effect's strength eases toward how big the waves still are, so the last ripples fade out smoothly.
        const peak = step();
        const target = Math.min(1, peak / FULL_WAVE);
        energy += (target - energy) * (target > energy ? ENERGY_RISE : ENERGY_FALL);
        calm = energy < 0.005; // too faint to see: settle completely
        if (calm) {
          energy = 0;
          pixels.fill(128);
        }
        gl.uniform1f(uEnergy, energy);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, waterTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, cols, rows, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels);
      }
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (last) {
        // Drop ripples along the path, a little stronger the faster the pointer moves. Small jitters
        // and a resting cursor do nothing, so it only reacts to deliberate movement.
        const travelled = Math.hypot((x - last.x) * rect.width, (y - last.y) * rect.height);
        const steps = Math.min(12, Math.ceil(travelled / 8));
        const amount = Math.min(Math.max(travelled - 4, 0) * 0.008, 0.4);
        for (let s = 1; s <= steps; s += 1) {
          disturb(last.x + ((x - last.x) * s) / steps, last.y + ((y - last.y) * s) / steps, amount);
        }
      }
      last = { x, y };
    };
    const leave = () => {
      last = null;
    };

    const img = new Image();
    img.onload = () => {
      imageAspect = img.naturalWidth / img.naturalHeight;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      loaded = true;
      resize();
    };
    img.src = src;

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const wake = () => {
      if (visible && activeRef.current && !frame) frame = requestAnimationFrame(render);
    };
    wakeRef.current = wake;

    // Pause the loop while the hero is off screen.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    visibility.observe(canvas);

    const host = canvas.closest('section') ?? canvas.parentElement;
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      img.onload = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      gl.deleteTexture(imageTexture);
      gl.deleteTexture(waterTexture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [enabled, src, dim]);

  if (!enabled) {
    return (
      <>
        <motion.img src={src} alt="" {...props} />
        <div className="absolute inset-0 bg-ink" style={{ opacity: dim }} />
      </>
    );
  }
  return <motion.canvas ref={canvasRef} aria-hidden {...props} />;
};

export default FluidImage;
