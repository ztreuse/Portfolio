// One stratum's outline at time t (s) in a 2000 × 1000 box: a wavy top edge filled down to the bottom. Three waves
// of different lengths travel along the edge at the layer's own speed (`flow`, negative = leftward) and the long
// one swells and settles, so the edge keeps rolling like a slow liquid. It's wider than the screen so it can slide
// sideways without showing its ends.
const EDGE = 120;
const stratum = (seed, t, flow) => {
  let d = 'M0 1000 ';
  const swell = 1 + 0.35 * Math.sin(t * 0.4 * Math.abs(flow) + seed);
  for (let x = 0; x <= 2000; x += 20) {
    const y =
      EDGE +
      44 * swell * Math.sin(x * 0.004 + seed + t * 0.5 * flow) +
      20 * Math.sin(x * 0.011 + seed * 2.3 - t * 0.9 * flow) +
      8 * Math.sin(x * 0.027 + seed * 4.1 + t * 1.6 * flow);
    d += `L${x} ${y.toFixed(1)} `;
  }
  return `${d}L2000 1000 Z`;
};

export default stratum;
