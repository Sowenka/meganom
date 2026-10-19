import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PresenceContext } from 'framer-motion';
import PropTypes from 'prop-types';
import App, { preloadPage } from './App';
import './index.css';
import './i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');

// Пререндер (vite-plugin-seo-prerender) кладёт в #root готовую видимую разметку страницы.
// React её заменяет, поэтому первый рендер должен сразу дать ту же картинку:
// - модуль страницы грузим заранее, чтобы не мелькал спиннер Suspense (см. lazyPage);
// - входные анимации framer-motion на первом рендере отключены (как AnimatePresence
//   initial={false}): контент уже виден, "проявлять" его из opacity:0 значит мигнуть.
// После первого коммита новые motion-компоненты анимируются как обычно.
const isPrerendered = rootElement.hasChildNodes();
if (isPrerendered) {
  // Ошибку загрузки не глотаем насовсем: lazy повторит импорт и покажет её штатно.
  await preloadPage(window.location.pathname).catch(() => {});
}

const noopRegister = () => () => {};
const FIRST_RENDER_PRESENCE = { id: 'prerendered', initial: false, isPresent: true, register: noopRegister };
const AFTER_FIRST_RENDER_PRESENCE = { id: 'prerendered', isPresent: true, register: noopRegister };

function SkipInitialMotionOnFirstRender({ children }) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => setIsFirstRender(false), []);
  // Контекст всегда не null: framer-motion требует, чтобы он не менялся null <-> объект
  return (
    <PresenceContext.Provider value={isFirstRender ? FIRST_RENDER_PRESENCE : AFTER_FIRST_RENDER_PRESENCE}>
      {children}
    </PresenceContext.Provider>
  );
}

SkipInitialMotionOnFirstRender.propTypes = {
  children: PropTypes.node.isRequired,
};

const app = <App />;

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {isPrerendered ? <SkipInitialMotionOnFirstRender>{app}</SkipInitialMotionOnFirstRender> : app}
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
