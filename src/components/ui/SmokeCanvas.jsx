import { useEffect, useRef, useState } from 'react';

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Drifting smoke: layered (fbm) noise, folded into itself twice (domain warping) so it curls and billows like
// smoke, slowly moving with time. Only 3 noise layers, so it stays soft (5 gave too much fine, crisp detail). Its detail at every scale means there are no long, smooth ramps, so it doesn't
// band the way blurred blobs did; a sub-shade (below one 8-bit step) dither removes what's left.
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uScale;    // feature size: canvas pixels per noise unit
uniform float uTime;
uniform float uSeed;
uniform vec3 uColor;
uniform float uStrength;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 turn = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = turn * p * 2.02 + 3.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = gl_FragCoord.xy / uScale + uSeed;
  float t = uTime * 0.04;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + 0.6 * t), fbm(p + 3.5 * q + vec2(8.3, 2.8) - 0.5 * t));
  float f = fbm(p + 3.0 * r);
  float smoke = pow(smoothstep(0.3, 0.9, f), 1.6);
  // Wisps are brightest where the warp folds tightest, which gives the curling streaks.
  smoke *= 0.55 + 0.45 * smoothstep(0.2, 0.9, length(r));
  float alpha = smoke * uStrength;
  alpha += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  alpha = clamp(alpha, 0.0, 1.0);
  gl_FragColor = vec4(uColor * alpha, alpha);
}`;

const RESOLUTION = 0.5; // render scale: lower softens the smoke a little (the owner wanted it blurrier) and is cheaper
const FEATURE_PX = 520; // size of the largest smoke shapes, in CSS px
const FRAME_MS = 1000 / 30; // smoke moves slowly, so 30fps is plenty

const canUseSmoke = () => {
  try {
    return !!document.createElement('canvas').getContext('webgl');
  } catch {
    return false;
  }
};

/**
 * Full-size WebGL smoke layer (transparent canvas): `color` is the smoke's RGB (0–1), `strength` its strongest
 * opacity, `seed` shifts the pattern so two layers don't look alike. `paused` stops the animation loop while it
 * can't be seen. With reduced motion it draws one still frame. Without WebGL it renders nothing.
 */
const SmokeCanvas = ({ color, strength, seed = 0, paused = false, className = '' }) => {
  const canvasRef = useRef(null);
  const [enabled] = useState(canUseSmoke);
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
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return undefined;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
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

    const uScale = gl.getUniformLocation(program, 'uScale');
    const uTime = gl.getUniformLocation(program, 'uTime');
    gl.uniform1f(gl.getUniformLocation(program, 'uSeed'), seed);
    gl.uniform3f(gl.getUniformLocation(program, 'uColor'), color[0], color[1], color[2]);
    gl.uniform1f(gl.getUniformLocation(program, 'uStrength'), strength);

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1) * RESOLUTION;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uScale, FEATURE_PX * scale, FEATURE_PX * scale);
    };

    let frame = 0;
    let last = 0;
    const start = performance.now();
    const draw = (now) => {
      gl.uniform1f(uTime, still ? 0 : (now - start) / 1000);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (now) => {
      frame = activeRef.current && !document.hidden ? requestAnimationFrame(loop) : 0;
      if (now - last >= FRAME_MS) {
        last = now;
        draw(now);
      }
    };
    const wake = () => {
      if (still) return;
      if (activeRef.current && !document.hidden && !frame) frame = requestAnimationFrame(loop);
    };
    wakeRef.current = wake;

    resize();
    draw(performance.now());
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);
    document.addEventListener('visibilitychange', wake);
    wake();

    return () => {
      cancelAnimationFrame(frame);
      wakeRef.current = null;
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', wake);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [enabled, color, strength, seed]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`} />;
};

export default SmokeCanvas;
