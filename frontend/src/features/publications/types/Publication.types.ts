/**
 * Publication Domain Types
 *
 * All types for the publications feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Publication {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Publication-specific fields here
}

export interface PublicationDraft {
  // TODO: fields required to create a new Publication
}

export interface PublicationUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface PublicationFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Publication;
  sortOrder?: 'asc' | 'desc';
}

export interface PublicationsResponse {
  data: Publication[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
