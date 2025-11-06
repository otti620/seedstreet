// src/utils/default-avatars.ts

// List of default avatar image paths
const DEFAULT_AVATAR_PATHS = [
  '/avatars/memoji/memoji-1.png',
  '/avatars/memoji/memoji-2.png',
  // Add more paths here if you have more memoji images (e.g., '/avatars/memoji/memoji-3.png')
];

export const DEFAULT_AVATAR_COUNT = DEFAULT_AVATAR_PATHS.length;

export const getDefaultAvatarUrl = (avatarId: number | null) => {
  if (avatarId === null || avatarId < 1) {
    // Fallback to the first avatar if avatarId is null or invalid
    return DEFAULT_AVATAR_PATHS[0];
  }
  // Use modulo to cycle through available avatars if avatarId is larger than count
  // avatarId is 1-indexed, so we subtract 1 for 0-indexed array access
  const index = (avatarId - 1) % DEFAULT_AVATAR_COUNT;
  return DEFAULT_AVATAR_PATHS[index];
};