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

const TOTAL = 129;

// Photo index → category mapping (1-based index matching file names 001-129)
const categoryMap = {
  territory: [
    1, 2, 6, 7, 8, 9, 35, 36, 37, 38, 39, 50, 51, 52, 53, 54,
    79, 80, 81, 82, 98, 99, 100, 101, 102, 103, 108, 109, 110, 111, 112,
    113, 114, 115, 116, 123, 125, 129,
  ],
  rooms: [
    3, 4, 10, 11, 12, 13, 40, 41, 42, 43, 44, 60, 61, 62, 63, 64, 65, 66, 67,
    68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 90, 91, 92, 117, 118, 119,
    120, 121, 122, 126, 127, 128,
  ],
  beach: [
    5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    32, 33, 34, 78, 104, 105, 106, 107, 124,
  ],
  amenities: [
    45, 46, 47, 48, 49, 55, 56, 57, 58, 59, 83, 84, 85, 86, 87, 88, 89, 93, 94,
    95, 96, 97,
  ],
  surroundings: [
    31,
  ],
};

// Build reverse lookup: index → category
const indexToCategory = {};
for (const [cat, indices] of Object.entries(categoryMap)) {
  for (const idx of indices) {
    indexToCategory[idx] = cat;
  }
}

// Generate photos array
export const photos = Array.from({ length: TOTAL }, (_, i) => {
  const idx = i + 1;
  const num = String(idx).padStart(3, '0');
  return {
    id: idx,
    src: `${import.meta.env.BASE_URL}gallery/${num}.webp`,
    category: indexToCategory[idx] || 'territory',
  };
});

export const categories = ['all', 'territory', 'rooms', 'beach', 'amenities', 'surroundings'];
