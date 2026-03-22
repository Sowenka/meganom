import { useState, useEffect } from 'react';

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const CACHE_KEY = 'weather_cache_sudak_v1';
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

const CITY = { name: 'Судак', lat: 44.8511, lon: 34.9785 };

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (data && Date.now() - timestamp < CACHE_TIME) {
            setWeather(data);
            setLoading(false);
            return;
          }
        }
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }

      try {
        const params = new URLSearchParams({
          latitude: CITY.lat,
          longitude: CITY.lon,
          current: 'temperature_2m,weather_code',
          timezone: 'Europe/Moscow',
        });
        const res = await fetch(`${API_URL}?${params}`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        const data = {
          name: CITY.name,
          temp: Math.round(json.current.temperature_2m),
          code: json.current.weather_code,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        setWeather(data);
      } catch {
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const { data } = JSON.parse(cached);
            if (data) setWeather(data);
          }
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading };
}

// WMO weather code → description (RU)
export function getWeatherDesc(code) {
  const map = {
    0: 'Ясно',
    1: 'Малооблачно',
    2: 'Переменная облачность',
    3: 'Пасмурно',
    45: 'Туман',
    48: 'Туман',
    51: 'Морось',
    53: 'Морось',
    55: 'Морось',
    61: 'Дождь',
    63: 'Дождь',
    65: 'Сильный дождь',
    66: 'Ледяной дождь',
    67: 'Ледяной дождь',
    71: 'Снег',
    73: 'Снег',
    75: 'Сильный снег',
    77: 'Снежная крупа',
    80: 'Ливень',
    81: 'Ливень',
    82: 'Сильный ливень',
    85: 'Снегопад',
    86: 'Сильный снегопад',
    95: 'Гроза',
    96: 'Гроза с градом',
    99: 'Гроза с градом',
  };
  return map[code] ?? 'Н/Д';
}
