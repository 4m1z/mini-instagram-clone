export const imageKeys = {
  lists: ["images"] as const,
  list: (tag: string | null) => ["images", tag] as const,
  tags: ["tags"] as const,
};
