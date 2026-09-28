export interface DocItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  order: number;
  badge?: string; // e.g. "Core", "New", "v2.0", "Security"
  badgeColor?: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'slate';
  description?: string;
  content: string; // Rich HTML string
  createdAt: string;
  updatedAt: string;
  author?: string;
  readTime?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  order: number;
  description?: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number; // 1, 2, 3
}

export interface DocStoreData {
  version: string;
  categories: Category[];
  documents: DocItem[];
  siteTitle: string;
}
