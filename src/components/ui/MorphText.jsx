import { useEffect, useRef } from 'react';

// Room around the line box: the heavy glyphs reach past their tight 0.85 line height, and warped strokes
// can stretch further.
const PAD = 0.25;
// How many recent cursor points bend the letters (a short trail), and how fast each one's pull fades.
const POINTS = 24;
const FADE = 0.94;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Each trail point pulls nearby pixels: smeared along its direction of travel, twisted around it and stirred by
// noise, all weighted by a soft falloff. Sampling the name from the displaced position bends the letters.
const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uText;
uniform vec2 uSize;
uniform float uTime;
uniform float uRadius;
uniform vec4 uPoint[${POINTS}];
uniform vec2 uVel[${POINTS}];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 q = p;
  for (int i = 0; i < ${POINTS}; i++) {
    vec4 pt = uPoint[i];
    if (pt.z <= 0.0) continue;
    vec2 d = q - pt.xy;
    float f = exp(-dot(d, d) / (uRadius * uRadius)) * pt.z;
    // Twist around the point
    float a = f * 1.8;
    d = mat2(cos(a), -sin(a), sin(a), cos(a)) * d;
    q = pt.xy + d;
    // Smear along the stroke
    q -= uVel[i] * f * 1.3;
    // Liquid wobble
    vec2 n = vec2(noise(q * 0.018 + uTime * 0.8), noise(q * 0.018 - uTime * 0.7 + 17.0)) - 0.5;
    q += n * uRadius * 1.4 * f;
  }
  gl_FragColor = texture2D(uText, q / uSize);
}`;

/**
 * Liquid letters: when the mouse touches the hero name, the strokes near it bend, smear along the movement, twist
 * and wobble into abstract shapes, then flow back into crisp letters about a second after it stops.
 *
 * A WebGL canvas over the name draws the words itself (same font, colours, letter spacing and laid-out positions)
 * and warps them. It's only shown while the letters are bent: then the real words are made transparent (they stay
 * for layout, selection and screen readers) and restored once everything has settled, so at rest it's the plain
 * DOM text. Mouse-type pointers only, nothing for reduced motion or without WebGL, and only after the name has
 * finished revealing. Render it inside the (relative) heading; the words are its `[data-morph-word]` elements.
 * Pass `fit` (the fitted font size) so the drawing is redone on resize. Like FluidImage, it never destroys its
 * WebGL context on cleanup (StrictMode remounts the same canvas in dev).
 */
const MorphText = ({ fit }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    if (!canvas || !box) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
    if (!gl) return undefined;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    const uniform = (name) => gl.getUniformLocation(program, name);
    const uSize = uniform('uSize');
    const uTime = uniform('uTime');
    const uRadius = uniform('uRadius');
    const uPoint = uniform('uPoint');
    const uVel = uniform('uVel');

    const text = document.createElement('canvas');
    const textCtx = text.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointData = new Float32Array(POINTS * 4);
    const velData = new Float32Array(POINTS * 2);
    const points = [];
    let pad = 0;
    let width = 0;
    let height = 0;
    let radius = 80;
    let frame = 0;
    let last = null;
    let hidden = false;

    const words = () => [...box.querySelectorAll('[data-morph-word]')];

    // Draw the words into the texture exactly where (and how) the browser laid them out
    const build = () => {
      const list = words();
      if (!list.length) return;
      const size = parseFloat(getComputedStyle(box).fontSize);
      pad = size * PAD;
      radius = size * 0.14;
      width = box.clientWidth + pad * 2;
      height = box.clientHeight + pad * 2;
      for (const c of [canvas, text]) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      }
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      textCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      textCtx.clearRect(0, 0, width, height);
      for (const word of list) {
        const style = getComputedStyle(word);
        textCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        textCtx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
        // While the words are hidden their colour is transparent; the real one is kept in data-color
        textCtx.fillStyle = word.dataset.color || style.color;
        const metrics = textCtx.measureText(word.textContent);
        const ascent = metrics.fontBoundingBoxAscent;
        const descent = metrics.fontBoundingBoxDescent;
        // CSS centres the font's ascent + descent in the line height; the baseline sits below the ascent
        const baseline = (parseFloat(style.lineHeight) - (ascent + descent)) / 2 + ascent;
        // offsetLeft/Top are relative to the heading and ignore the reveal's transforms
        let x = 0;
        let y = 0;
        for (let el = word; el && el !== box; el = el.offsetParent) {
          x += el.offsetLeft;
          y += el.offsetTop;
        }
        textCtx.fillText(word.textContent.toUpperCase(), x + pad, y + pad + baseline);
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, text);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // Swap between the real words and the canvas drawing of them
    const setHidden = (value) => {
      if (hidden === value) return;
      hidden = value;
      for (const word of words()) {
        if (value) {
          word.dataset.color = getComputedStyle(word).color;
          word.style.color = 'transparent';
        } else {
          word.style.color = '';
        }
      }
      canvas.style.opacity = value ? '1' : '0';
    };

    const render = (time) => {
      for (const p of points) p.s *= FADE;
      while (points.length && points[0].s < 0.01) points.shift();
      pointData.fill(0);
      velData.fill(0);
      points.forEach((p, i) => {
        pointData.set([p.x, p.y, p.s, 0], i * 4);
        velData.set([p.vx, p.vy], i * 2);
      });
      gl.uniform2f(uSize, width, height);
      gl.uniform1f(uTime, time / 1000);
      gl.uniform1f(uRadius, radius);
      gl.uniform4fv(uPoint, pointData);
      gl.uniform2fv(uVel, velData);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (points.length) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
        setHidden(false);
      }
    };

    const revealed = () => words().every((word) => getComputedStyle(word).opacity === '1');

    const move = (event) => {
      const rect = canvas.getBoundingClientRect();
      // The canvas can be scaled by the hero's dive; map back to its own CSS pixels
      const scale = rect.width / width || 1;
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;
      const prev = last;
      last = { x, y };
      if (!prev || x < 0 || y < 0 || x > width || y > height) return;
      const vx = x - prev.x;
      const vy = y - prev.y;
      const speed = Math.hypot(vx, vy);
      if (speed < 1.5 || (!hidden && !revealed())) return;
      // Faster strokes pull harder; the smear is capped so a flick doesn't tear the letters apart
      const cap = Math.min(1, 26 / speed);
      points.push({ x, y, vx: vx * cap, vy: vy * cap, s: Math.min(1, 0.35 + speed / 30) });
      if (points.length > POINTS) points.shift();
      if (!frame) {
        setHidden(true);
        frame = requestAnimationFrame(render);
      }
    };
    const leave = () => {
      last = null;
    };

    build();
    canvas.style.opacity = '0';
    document.fonts?.ready.then(build);
    const observer = new ResizeObserver(build);
    observer.observe(box);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);

    return () => {
      cancelAnimationFrame(frame);
      setHidden(false);
      observer.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [fit]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute" />;
};

export default MorphText;
