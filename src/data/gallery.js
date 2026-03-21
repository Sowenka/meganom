/**
 * Gallery photo data with category assignments.
 * Categories based on visual review of all 129 photos from Yandex Travel.
 *
 * Categories:
 *   territory  — gates, buildings exterior, night lights, courtyard, garden, paths, gazebos
 *   rooms      — bedrooms, living areas, kitchens inside houses/rooms
 *   beach      — Oyster beach, Meganom bay, sea views, sunsets
 *   amenities  — pool, banya, bbq zone, outdoor kitchen, sports area
 *   surroundings — beach bar, pizzeria, winery area, decor, scenic views
 */

// Photo index → category mapping (1-based index matching file names 001-129)
// Only list files that physically exist in public/gallery/
// Photos NOT listed here will NOT appear in the gallery at all
const categoryMap = {
  territory: [
    1,
  ],
  rooms: [
    3, 4, 10, 11, 12, 13, 40, 41, 42, 43, 44, 60, 61, 62, 63, 64, 66, 67,
    68, 69, 71, 72, 73, 74, 75, 76, 77, 90, 92, 117, 119,
    120, 121, 122, 126, 127, 128,
  ],
  beach: [
    5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    32, 33, 34, 78, 104, 105, 106, 107, 124,
  ],
  amenities: [
    45, 46, 48, 49, 55, 56, 57, 58, 59, 84, 85, 86, 87, 88, 89, 93, 94,
    95, 96, 97,
  ],
  surroundings: [
    31,
  ],
};

// Build photos array ONLY from entries in categoryMap (no fallback, no broken links)
export const photos = Object.entries(categoryMap)
  .flatMap(([cat, indices]) =>
    indices.map((idx) => ({
      id: idx,
      src: `${import.meta.env.BASE_URL}gallery/${String(idx).padStart(3, '0')}.webp`,
      category: cat,
    }))
  )
  .sort((a, b) => a.id - b.id);

export const categories = ['all', 'territory', 'rooms', 'beach', 'amenities', 'surroundings'];
