import { useEffect, useState } from 'react';
import { profile } from '../../data/site';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: profile.timeZone,
  timeZoneName: 'shortOffset',
});

/** The current time where I am ("5:31 PM · GMT+8"), ticking over on the minute. */
const LocalTime = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), 60000 - (Date.now() % 60000));
    return () => clearTimeout(timer);
  }, [now]);

  const parts = timeFormat.formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type)?.value;

  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {part('hour')}:{part('minute')} {part('dayPeriod')} · {part('timeZoneName')}
    </time>
  );
};

export default LocalTime;
