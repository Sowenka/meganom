export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <p className="mb-8 text-lg text-text-muted">Страница не найдена</p>
      <a
        href="/"
        className="rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-warm"
      >
        На главную
      </a>
    </section>
  );
}
