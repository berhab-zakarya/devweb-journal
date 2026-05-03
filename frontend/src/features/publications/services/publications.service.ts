/**
 * Publication Service
 *
 * This is the ONLY place where API calls for the publications feature are made.
 * Uses the shared Axios client — never instantiate Axios directly here.
 */

import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import type {
  Publication,
  PublicationDraft,
  PublicationUpdatePayload,
  PublicationFilters,
  PublicationsResponse,
} from '../types/Publication.types';

const BASE = ENDPOINTS.PUBLICATIONS_BASE;

export const publicationsService = {
  /**
   * Fetch a paginated list of publications.
   */
  getAll: async (filters?: PublicationFilters): Promise<PublicationsResponse> => {
    const { data } = await apiClient.get<PublicationsResponse>(BASE, { params: filters });
    return data;
  },

  /**
   * Fetch a single publication by ID.
   */
  getById: async (id: string): Promise<Publication> => {
    const { data } = await apiClient.get<Publication>(`${BASE}/${id}`);
    return data;
  },

  /**
   * Create a new publication.
   */
  create: async (payload: PublicationDraft): Promise<Publication> => {
    const { data } = await apiClient.post<Publication>(BASE, payload);
    return data;
  },

  /**
   * Update an existing publication.
   */
  update: async ({ id, ...payload }: PublicationUpdatePayload): Promise<Publication> => {
    const { data } = await apiClient.patch<Publication>(`${BASE}/${id}`, payload);
    return data;
  },

  /**
   * Delete a publication by ID.
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
} as const;
