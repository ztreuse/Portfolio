import { useEffect, useRef, useState } from 'react';
import { LuCheck, LuCopy } from 'react-icons/lu';
import { profile } from '../../data/site';

/**
 * A small round button that copies my email address and shows a tick for a moment (the side index and the phone menu).
 * `tip` is an optional tooltip component, given the button's current name; without it the browser's title says it.
 */
const CopyEmail = ({ size = 'size-7', tip: Tip }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no clipboard access: the address is on show to select */
    }
  };

  const name = copied ? 'Copied!' : 'Copy email';
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      title={Tip ? undefined : name}
      className={`group/tip relative flex shrink-0 items-center justify-center rounded-full border border-white/15 text-stone-400 transition-colors duration-200 hover:border-matcha hover:bg-matcha hover:text-ink ${size}`}
    >
      {copied ? <LuCheck aria-hidden className="size-3.5 text-matcha" /> : <LuCopy aria-hidden className="size-3.5" />}
      {Tip && <Tip show>{name}</Tip>}
    </button>
  );
};

export default CopyEmail;
