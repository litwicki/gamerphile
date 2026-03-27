export interface Article {
  id: number;
  title: string;
  slug: string;
  body: string;
  source_url: string;
  source_name: string;
  category_id: number;
  author: string;
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export interface ArticleCategory {
  id: number;
  slug: string;
  label: string;
}

export interface ArticleWithCategory extends Article {
  category: ArticleCategory;
}

export const WOW_CATEGORIES = [
  "patch-notes",
  "raid-dungeon",
  "pvp",
  "class-changes",
  "mythic-plus",
  "race-world-first",
  "esports",
  "lore",
  "community",
  "general",
] as const;

export type WowCategorySlug = (typeof WOW_CATEGORIES)[number];
