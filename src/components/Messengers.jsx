import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const channels = [
  {
    name: 'Telegram',
    to: '/social-soon?network=tg',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  {
    name: 'VK',
    to: '/social-soon?network=vk',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.79 17.04c-5.14 0-8.08-3.52-8.2-9.38h2.58c.08 4.3 1.98 6.12 3.48 6.5V7.66h2.43v3.71c1.48-.16 3.03-1.86 3.55-3.71h2.43c-.4 2.28-2.08 3.98-3.27 4.68 1.19.56 3.1 2.06 3.82 4.7h-2.68c-.56-1.75-1.96-3.1-3.85-3.28v3.28h-.29z" />
      </svg>
    ),
  },
];

export function Messengers({ className = '', variant = 'dark' }) {
  const itemClass =
    variant === 'light'
      ? 'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 hover:bg-accent hover:text-white'
      : 'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors duration-200 hover:bg-accent hover:text-white';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {channels.map(({ name, to, icon }) => (
        <Link key={name} to={to} aria-label={name} className={itemClass}>
          {icon}
        </Link>
      ))}
    </div>
  );
}

Messengers.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['dark', 'light']),
};
