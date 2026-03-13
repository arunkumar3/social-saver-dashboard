export interface Bookmark {
  id: string;
  url: string;
  type: "tweet" | "thread" | "article";
  title: string;
  author: string;
  author_handle: string;
  full_text: string;
  images: string[];
  source_date: string | null;
  saved_at: string;
  category: string | null;
  action_item: string | null;
  action_status: "pending" | "done" | "skipped";
  key_insights: string[] | null;
  ai_processed: boolean;
}

export interface FilterState {
  types: Set<string>;
  categories: Set<string>;
  actionStatus: string | null;
}

export type ViewMode = "grid" | "actions";
