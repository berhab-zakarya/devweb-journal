export interface PublicationArticle {
  id: number;
  title: string;
  abstract: string;
  keywords: string;
  author?: { id: number; name: string; email: string };
  category?: { id: number; name: string; slug: string };
}

export interface Publication {
  id: number;
  article_id: number;
  article?: PublicationArticle;
  doi?: string;
  volume?: number;
  issue?: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Volume {
  volume: number;
  issue: number;
  count: number;
}

export interface PublicationFilters {
  search?: string;
  category?: string;
  page?: number;
}

export interface PaginatedPublications {
  data: Publication[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PublishArticlePayload {
  doi?: string;
  volume?: number;
  issue?: number;
}
