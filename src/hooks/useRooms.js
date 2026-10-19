import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getRooms, getRoomBySlug, findRooms, findRoomBySlug } from '@/services/rooms.service';

const STATIC_ROOM_SLUGS = new Set([
  'veter-peremen-myata',
  'veter-peremen-med',
  'shale',
  'kvartet-grand',
  'standart-kuhnya',
  'standart-balkon',
  'semeynyy-balkon',
  'semeynyy-topcan',
]);

function applyRoomTranslation(room, t) {
  if (!STATIC_ROOM_SLUGS.has(room.slug)) return room;
  return {
    ...room,
    title: t(`staticRooms.${room.slug}.title`),
    short_description: t(`staticRooms.${room.slug}.description`),
    full_description: t(`staticRooms.${room.slug}.fullDescription`),
    amenities: t(`staticRooms.${room.slug}.amenities`, { returnObjects: true }),
  };
}

export function useRooms(filters) {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => getRooms(filters),
    initialData: () => findRooms(filters),
  });

  const data = useMemo(
    () => query.data?.map((room) => applyRoomTranslation(room, t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, i18n.language],
  );

  return { ...query, data };
}

export function useRoom(slug) {
  const { t, i18n } = useTranslation();
  const query = useQuery({
    queryKey: ['room', slug],
    queryFn: () => getRoomBySlug(slug),
    initialData: () => (slug ? findRoomBySlug(slug) : undefined),
    enabled: !!slug,
  });

  const data = useMemo(
    () => query.data ? applyRoomTranslation(query.data, t) : query.data,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, i18n.language],
  );

  return { ...query, data };
}
