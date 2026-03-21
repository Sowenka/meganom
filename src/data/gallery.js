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
        1, 3, 7, 8, 11, 12, 13, 14, 17, 24, 28, 35, 37, 38, 39, 44, 46, 50, 56,
        57, 59, 61, 62, 64, 66, 67, 68, 72, 73, 75, 76, 77, 79, 82, 84, 86, 87,
        88, 92, 93, 94, 95, 97, 98, 99, 100, 101, 103, 104, 105, 106, 108, 109,
        110, 111, 112, 113, 114, 116, 123, 125, 129,
    ],
    rooms: [
        2, 4, 5, 6, 9, 10, 11, 12, 24, 28, 29, 40, 41, 42, 43, 44, 45, 48, 49, 51, 54, 55, 60, 63, 64, 66, 68, 69, 71, 77, 79, 89, 90, 96, 102, 105, 107, 115, 117, 119, 120, 121, 122, 124, 127, 128, 129
    ],
    beach: [
        15, 16, 18, 19, 20, 21, 22, 23, 25, 26, 27, 30, 31, 32, 33, 34, 36, 78, 85,
    ],
    amenities: [
        4, 29, 41, 42, 43, 44, 45, 46, 48, 49, 51, 56, 59, 61, 64, 68, 71, 75, 76, 77, 79, 86, 87, 88, 95, 96, 105, 124,
    ],
    surroundings: [
        1, 7, 17, 39, 50, 64, 89, 93, 94, 106, 112,
    ],
};

// Build id → categories[] map
const idToCategories = {};
for (const [cat, indices] of Object.entries(categoryMap)) {
    for (const idx of indices) {
        if (!idToCategories[idx]) idToCategories[idx] = [];
        idToCategories[idx].push(cat);
    }
}

// Each photo appears exactly ONCE; categories is an array for multi-category filtering
export const photos = Object.keys(idToCategories)
    .map(Number)
    .sort((a, b) => a - b)
    .map((idx) => ({
        id: idx,
        src: `${import.meta.env.BASE_URL}gallery/${String(idx).padStart(3, '0')}.webp`,
        categories: idToCategories[idx],
    }));

export const categories = ['all', 'territory', 'rooms', 'beach', 'amenities', 'surroundings'];
