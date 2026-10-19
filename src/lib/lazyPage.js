import { lazy } from 'react';

/**
 * React.lazy с возможностью предзагрузки модуля.
 *
 * Зачем: страницы приходят из пререндера уже с готовой разметкой в #root.
 * Обычный lazy() на первом рендере всегда "засыпает" и показывает Suspense-фоллбек,
 * то есть готовый контент мигает спиннером. Если модуль загружен заранее через
 * preload(), lazy получает thenable, который резолвится синхронно, и React рендерит
 * страницу с первого прохода, без фоллбека.
 */
export function lazyPage(load) {
  let loaded = null;

  const preload = () =>
    load().then((mod) => {
      loaded = mod;
      return mod;
    });

  const Page = lazy(() => (loaded ? { then: (resolve) => resolve(loaded) } : preload()));
  Page.preload = preload;
  return Page;
}
