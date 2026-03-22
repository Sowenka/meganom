import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  WiDaySunny,
  WiDaySunnyOvercast,
  WiDayCloudy,
  WiCloudy,
  WiFog,
  WiSprinkle,
  WiRain,
  WiSnow,
  WiShowers,
  WiSnowWind,
  WiThunderstorm,
  WiStormShowers,
  WiThermometer,
} from 'react-icons/wi';
import { cn } from '@/lib/utils';
import { useWeather, getWeatherDesc } from '@/hooks/useWeather';

function getWeatherIcon(code) {
  if (code === 0) return WiDaySunny;
  if (code === 1) return WiDaySunnyOvercast;
  if (code === 2) return WiDayCloudy;
  if (code === 3) return WiCloudy;
  if (code === 45 || code === 48) return WiFog;
  if (code >= 51 && code <= 55) return WiSprinkle;
  if (code >= 61 && code <= 67) return WiRain;
  if (code >= 71 && code <= 77) return WiSnow;
  if (code >= 80 && code <= 82) return WiShowers;
  if (code === 85 || code === 86) return WiSnowWind;
  if (code === 95) return WiThunderstorm;
  if (code === 96 || code === 99) return WiStormShowers;
  return WiThermometer;
}

// Mobile variant: fixed badge visible only while hero is in view (scrollY < 55vh)
function MobileWeatherBadge({ weather, loading, className }) {
  const [inHero, setInHero] = useState(true);

  useEffect(() => {
    const onScroll = () => setInHero(window.scrollY < window.innerHeight * 0.55);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (loading) {
    return (
      <AnimatePresence>
        {inHero && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('fixed right-4 top-[85px] z-40', className)}
          >
            <div className="h-8 w-20 animate-pulse rounded-full bg-primary/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (!weather) return null;

  const Icon = getWeatherIcon(weather.code);
  const temp = weather.temp > 0 ? `+${weather.temp}` : `${weather.temp}`;
  const desc = getWeatherDesc(weather.code);

  return (
    <AnimatePresence>
      {inHero && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={cn('fixed right-4 top-[85px] z-40', className)}
          title={`${weather.name}: ${desc}`}
        >
          <div className="flex items-center gap-1 rounded-full border border-white/25 bg-primary/75 px-3 py-1 shadow-lg backdrop-blur-md">
            <Icon className="h-5 w-5 shrink-0 text-accent-warm" />
            <span className="text-sm font-semibold text-white">{temp}°</span>
            <span className="text-xs text-white/60">Судак</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

MobileWeatherBadge.propTypes = {
  weather: PropTypes.shape({
    name: PropTypes.string,
    temp: PropTypes.number,
    code: PropTypes.number,
  }),
  loading: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

export function WeatherWidget({ className, mobile }) {
  const { weather, loading } = useWeather();

  if (mobile) {
    return <MobileWeatherBadge weather={weather} loading={loading} className={className} />;
  }

  // Desktop variant — inline in header
  if (loading) {
    return (
      <div className={cn('items-center gap-1.5', className)}>
        <div className="h-4 w-16 animate-pulse rounded bg-white/20" />
      </div>
    );
  }

  if (!weather) return null;

  const Icon = getWeatherIcon(weather.code);
  const temp = weather.temp > 0 ? `+${weather.temp}` : `${weather.temp}`;
  const desc = getWeatherDesc(weather.code);

  return (
    <div
      className={cn('items-center gap-0.5 text-white/80 transition-colors hover:text-white', className)}
      title={`${weather.name}: ${desc}`}
    >
      <Icon className="h-6 w-6 shrink-0 text-accent-warm" />
      <span className="text-sm font-medium">{temp}°</span>
      <span className="ml-0.5 text-xs text-white/50">Судак</span>
    </div>
  );
}

WeatherWidget.propTypes = {
  className: PropTypes.string,
  mobile: PropTypes.bool,
};
