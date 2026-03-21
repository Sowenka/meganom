import { useParams } from 'react-router-dom';

export default function RoomDetail() {
  const { slug } = useParams();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold text-primary">Номер: {slug}</h1>
      <p className="text-text-muted">Детали номера будут здесь.</p>
    </section>
  );
}
