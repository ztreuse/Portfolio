// Shared motion variants (kept out of Reveal.jsx so that file exports only components).
const ease = [0.22, 1, 0.36, 1];

// Image reveal: fades in while settling from a slight zoom and coming into focus.
// (The owner rejected a bottom-to-top clip-path wipe as looking like filling up with water.)
export const imageReveal = {
  hidden: { opacity: 0, scale: 1.08, filter: 'blur(8px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.1, ease } },
};
