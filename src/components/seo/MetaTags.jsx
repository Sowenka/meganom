import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { SITE_NAME, SITE_URL } from '@/lib/constants';

export function MetaTags({ title, description, path = '', image, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image || `${SITE_URL}/gallery/088.webp`;

  useEffect(() => {
    if (!noindex) return undefined;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
    // На остальных страницах индексация должна вернуться
    return () => robots.setAttribute('content', 'index, follow');
  }, [noindex]);

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle);
    setMeta('og:description', description);
    setMeta('og:url', canonical);
    setMeta('og:image', ogImage);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }, [fullTitle, description, canonical, ogImage]);

  return null;
}

MetaTags.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  path: PropTypes.string,
  image: PropTypes.string,
  noindex: PropTypes.bool,
};
