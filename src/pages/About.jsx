import { useTranslation } from 'react-i18next';
import { FiMapPin, FiStar, FiCoffee, FiGrid, FiAward } from 'react-icons/fi';

const sectionIcons = {
  territory: FiGrid,
  services: FiStar,
  nearby: FiMapPin,
};

export default function About() {
  const { t } = useTranslation();

  const territory = t('about.territory.items', { returnObjects: true });
  const services = t('about.services.items', { returnObjects: true });
  const nearby = t('about.nearby.items', { returnObjects: true });
  const roomTypes = t('about.rooms.types', { returnObjects: true });

  const sections = [
    { key: 'territory', icon: FiGrid, items: territory },
    { key: 'services', icon: FiStar, items: services },
    { key: 'nearby', icon: FiMapPin, items: nearby },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-primary">
          {t('about.title')}
        </h1>
        <p className="mt-2 text-lg text-text-muted">{t('about.subtitle')}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
          <FiAward className="h-5 w-5 text-accent" />
          <span className="font-medium text-text">
            {t('reviews.rating')} / {t('reviews.ratingMax')}
          </span>
          <span className="text-sm text-text-muted">
            — {t('reviews.reviewCount')} ({t('reviews.source')})
          </span>
        </div>
      </div>

      <p className="mx-auto mb-12 max-w-3xl text-center leading-relaxed text-text-muted">
        {t('about.description')}
      </p>

      {/* Info sections */}
      <div className="grid gap-8 lg:grid-cols-3">
        {sections.map(({ key, icon: Icon, items }) => (
          <div
            key={key}
            className="rounded-2xl border border-bg-dark bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-text">
                {t(`about.${key}.title`)}
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5">
              {Array.isArray(items) && items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Room types */}
      <div className="mt-12">
        <h2 className="mb-6 text-center font-serif text-2xl font-bold text-primary">
          {t('about.rooms.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(roomTypes) && roomTypes.map((room, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-bg-dark bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiCoffee className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-text">{room.name}</p>
                <p className="text-sm text-text-muted">
                  {room.area} · {room.capacity}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-text-muted">
          {t('about.allRoomsInclude')}
        </p>
      </div>
    </section>
  );
}
