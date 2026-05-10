import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { normalizeLaravelPaginator, normalizeSimpleCollection, unwrapData } from '@/shared/api/response';
import type {
  PublicationListItem,
  PublicationDetail,
  PaginatedPublications,
  PublicationFilters,
  PublishArticlePayload,
  Volume,
} from '../types/Publication.types';

const BASE = ENDPOINTS.PUBLICATIONS_BASE;
const ARTICLES = ENDPOINTS.ARTICLES_BASE;

export const publicationsService = {
  getAll: async (filters?: PublicationFilters): Promise<PaginatedPublications> => {
    const response = await apiClient.get(BASE, { params: filters });
    return normalizeLaravelPaginator<PublicationListItem>(response);
  },

  getById: async (id: number): Promise<PublicationDetail> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return unwrapData<PublicationDetail>({ data }) as PublicationDetail;
  },

  getVolumes: async (): Promise<Volume[]> => {
    const { data } = await apiClient.get(`${BASE}/volumes`);
    return normalizeSimpleCollection<Volume>({ data });
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`${BASE}/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  publish: async (
    articleId: number,
    payload: PublishArticlePayload
  ): Promise<{
    id: number;
    article_id: number;
    article_version_id: number;
    published_at: string;
    doi: string | null;
    volume: string | null;
    issue: string | null;
    created_at: string;
    updated_at: string;
  }> => {
    const { data } = await apiClient.post(`${ARTICLES}/${articleId}/publish`, payload);
    return unwrapData<{
      id: number;
      article_id: number;
      article_version_id: number;
      published_at: string;
      doi: string | null;
      volume: string | null;
      issue: string | null;
      created_at: string;
      updated_at: string;
    }>({ data }) as {
      id: number;
      article_id: number;
      article_version_id: number;
      published_at: string;
      doi: string | null;
      volume: string | null;
      issue: string | null;
      created_at: string;
      updated_at: string;
    };
  },
} as const;
