export const defaultAvatarUrls = [
  "/avatars/memoji/memoji-1.png",
  "/avatars/memoji/memoji-2.png",
  // Add more paths here if you have more memoji images (e.g., "/avatars/memoji/memoji-3.png")
];

export const DEFAULT_AVATAR_COUNT = defaultAvatarUrls.length; // Export the count

export const getAvatarUrl = (avatarId: number | null | undefined): string => {
  if (avatarId && avatarId >= 1) {
    // Use modulo to cycle through available avatars if avatarId is larger than count
    // avatarId is 1-indexed, so we subtract 1 for 0-indexed array access
    const index = (avatarId - 1) % defaultAvatarUrls.length;
    return defaultAvatarUrls[index];
  }
  // Fallback to a default if ID is invalid or missing
  return defaultAvatarUrls[0]; // Always return the first avatar as a fallback
};