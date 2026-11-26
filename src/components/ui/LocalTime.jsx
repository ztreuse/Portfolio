import { useEffect, useState } from 'react';
import { profile } from '../../data/site';

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: profile.timeZone,
  timeZoneName: 'shortOffset',
});

/** The current time where I am ("5:31 PM · GMT+8"), ticking over on the minute. `offset={false}` drops the "GMT+8". */
const LocalTime = ({ offset = true }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setTimeout(() => setNow(new Date()), 60000 - (Date.now() % 60000));
    return () => clearTimeout(timer);
  }, [now]);

  const parts = timeFormat.formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type)?.value;

  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {part('hour')}:{part('minute')} {part('dayPeriod')}
      {offset && ` · ${part('timeZoneName')}`}
    </time>
  );
};

export default LocalTime;
