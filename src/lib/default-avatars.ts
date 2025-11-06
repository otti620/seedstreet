export const defaultAvatarUrls = [
  "/avatars/memojis/memoji-1.png",
  "/avatars/memojis/memoji-2.png",
  "/avatars/memojis/memoji-3.png",
  "/avatars/memojis/memoji-4.png",
  "/avatars/memojis/memoji-5.png",
  "/avatars/memojis/memoji-6.png",
];

export const getAvatarUrl = (avatarId: number | null | undefined): string => {
  if (avatarId && avatarId >= 1 && avatarId <= defaultAvatarUrls.length) {
    return defaultAvatarUrls[avatarId - 1];
  }
  // Fallback to a default if ID is invalid or missing, or return a generic placeholder
  return "/avatars/memojis/memoji-1.png"; // Or a generic placeholder image
};