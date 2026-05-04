import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Publication,
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

  getById: async (id: number): Promise<Publication> => {
    const { data } = await apiClient.get<Publication>(`${BASE}/${id}`);
    return data;
  },

  getVolumes: async (): Promise<Volume[]> => {
    const { data } = await apiClient.get<Volume[]>(`${BASE}/volumes`);
    return data;
  },

  download: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`${BASE}/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  },

  publish: async (articleId: number, payload: PublishArticlePayload): Promise<Publication> => {
    const { data } = await apiClient.post<Publication>(`${ARTICLES}/${articleId}/publish`, payload);
    return data;
  },
} as const;
