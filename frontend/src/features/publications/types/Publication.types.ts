export interface PaginatorLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatorMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PublicationListItem {
  id: number;
  published_at: string;
  doi: string | null;
  volume: string | null;
  issue: string | null;
  article_id: number;
  title: string;
  abstract: string;
  keywords: string;
  category_name: string;
  category_slug: string;
  author_name?: string;
}

export interface PublicationDetail {
  id: number;
  published_at: string;
  doi: string | null;
  volume: string | null;
  issue: string | null;
  article_version_id: number;
  article_id: number;
  title: string;
  abstract: string;
  keywords: string;
  category_name: string;
  category_slug: string;
  author_name: string;
}

export interface Volume {
  volume: string | null;
  issue: string | null;
  year: number;
}

export interface PublicationFilters {
  search?: string;
  category?: string;
  volume?: string;
  issue?: string;
  year?: number;
  author?: string;
  page?: number;
}

export interface PaginatedPublications {
  data: {
    current_page: number;
    data: PublicationListItem[];
    first_page_url: string;
    last_page_url: string;
    links: PaginatorLinks;
    meta: PaginatorMeta;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    total: number;
  };
}

export interface PublishArticlePayload {
  published_at?: string | null;
  doi?: string | null;
  volume?: string | null;
  issue?: string | null;
}
