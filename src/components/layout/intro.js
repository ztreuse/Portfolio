// Whether the coffee intro has already played in this browser tab session. Storage can be blocked (private windows,
// cleared site data); then it just plays every time.
const KEY = 'intro-seen';

const read = () => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const introSeen = read();

export const markIntroSeen = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // nothing to do: it plays again next time
  }
};
