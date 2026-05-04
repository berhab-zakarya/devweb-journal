import { apiClient } from '@/shared/api/client';
import { ensureCsrfCookie } from '@/shared/api/csrf';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
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
    const { data } = await apiClient.get<PaginatedPublications>(BASE, { params: filters });
    return data;
  },

  getById: async (id: number): Promise<PublicationDetail> => {
    const { data } = await apiClient.get<{ data: PublicationDetail }>(`${BASE}/${id}`);
    return data.data;
  },

  getVolumes: async (): Promise<Volume[]> => {
    const { data } = await apiClient.get<{ data: Volume[] }>(`${BASE}/volumes`);
    return data.data;
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
    await ensureCsrfCookie();
    const { data } = await apiClient.post<{
      message: string;
      data: {
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
    }>(`${ARTICLES}/${articleId}/publish`, payload);
    return data.data;
  },
} as const;
