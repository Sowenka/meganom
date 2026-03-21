import PropTypes from 'prop-types';

const channels = [
  {
    name: 'Telegram',
    href: 'https://t.me/meganom_hotel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
  },
  {
    name: 'WhatsApp',
    href: 'https://wa.me/79781234567',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.19 5.06 4.47.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5c-1.77 0-3.5-.47-5.02-1.37l-.36-.21-3.73.98.99-3.63-.24-.37A9.42 9.42 0 0 1 2.5 12.05c0-5.24 4.27-9.5 9.52-9.5 2.54 0 4.93.99 6.73 2.78a9.47 9.47 0 0 1 2.78 6.73c-.01 5.24-4.27 9.5-9.48 9.5zM12.05.5C5.68.5.5 5.67.5 12.05c0 2.04.53 4.03 1.54 5.78L.5 23.5l5.83-1.53A11.46 11.46 0 0 0 12.05 23.5c6.37 0 11.55-5.18 11.55-11.55C23.6 5.58 18.42.5 12.05.5z" />
      </svg>
    ),
  },
  {
    name: 'VK',
    href: 'https://vk.com/meganom_hotel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12.79 17.04c-5.14 0-8.08-3.52-8.2-9.38h2.58c.08 4.3 1.98 6.12 3.48 6.5V7.66h2.43v3.71c1.48-.16 3.03-1.86 3.55-3.71h2.43c-.4 2.28-2.08 3.98-3.27 4.68 1.19.56 3.1 2.06 3.82 4.7h-2.68c-.56-1.75-1.96-3.1-3.85-3.28v3.28h-.29z" />
      </svg>
    ),
  },
];

export function Messengers({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {channels.map(({ name, href, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-accent hover:text-white"
        >
          {icon}
        </a>
      ))}
    </div>
  );
}

Messengers.propTypes = {
  className: PropTypes.string,
};
