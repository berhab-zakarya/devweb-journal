/**
 * Assignment Domain Types
 *
 * All types for the assignments feature live here.
 * Do NOT import types from other features — use shared/types if needed.
 */

export interface Assignment {
  id: string;
  createdAt: string;
  updatedAt: string;
  // TODO: add your Assignment-specific fields here
}

export interface AssignmentDraft {
  // TODO: fields required to create a new Assignment
}

export interface AssignmentUpdatePayload {
  id: string;
  // TODO: fields allowed to update
}

export interface AssignmentFilters {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Assignment;
  sortOrder?: 'asc' | 'desc';
}

export interface AssignmentsResponse {
  data: Assignment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
