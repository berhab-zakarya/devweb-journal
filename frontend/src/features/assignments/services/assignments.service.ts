import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints.constants';
import { unwrapData } from '@/shared/api/response';
import { articlesService } from '@/features/articles/services/articles.service';
import type { Article, ArticleAssignment } from '@/features/articles/types/Article.types';
import type { Assignment, AssignmentResponse, AssignmentReview, SubmitReviewPayload } from '../types/Assignment.types';

const BASE = ENDPOINTS.ASSIGNMENTS_BASE;

function toAssignment(article: Article, a: ArticleAssignment): Assignment {
  let response: AssignmentResponse | null = null;
  if (a.status === 'decline') {
    response = 'decline';
  } else if (a.status === 'accepted' || a.status === 'complete') {
    response = 'accepted';
  }
  return {
    id: a.id,
    article_id: article.id,
    reviewer_id: a.reviewer_id,
    due_date: a.due_date ?? '',
    response,
    status: a.status,
    created_at: a.created_at ?? new Date().toISOString(),
    updated_at: a.created_at ?? new Date().toISOString(),
    article: {
      id: article.id,
      title: article.title,
      abstract: article.abstract,
      status: article.status,
    },
  };
}

export const assignmentsService = {
  /**
   * Reviewer dashboard: compose assignments from paginated articles + per-article assignment lists
   * (no GET /assignments collection on the API).
   */
  listMineForReviewer: async (): Promise<Assignment[]> => {
    const rows: Assignment[] = [];
    const seen = new Set<number>();
    let page = 1;
    let lastPage = 1;
    do {
      const batch = await articlesService.getAll({ page });
      lastPage = batch.meta?.last_page ?? page;
      for (const article of batch.items) {
        const assigns = await articlesService.getAssignments(article.id);
        for (const a of assigns) {
          if (seen.has(a.id)) continue;
          seen.add(a.id);
          rows.push(toAssignment(article, a));
        }
      }
      page++;
    } while (page <= lastPage);

    return rows.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getById: async (id: number): Promise<Assignment> => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return unwrapData<Assignment>({ data }) as Assignment;
  },

  respond: async (id: number, response: 'accepted' | 'decline'): Promise<Assignment> => {
    const { data } = await apiClient.patch(`${BASE}/${id}/respond`, { response });
    return unwrapData<Assignment>({ data }) as Assignment;
  },

  getReview: async (id: number): Promise<AssignmentReview> => {
    const { data } = await apiClient.get(`${BASE}/${id}/review`);
    return unwrapData<AssignmentReview>({ data }) as AssignmentReview;
  },

  submitReview: async (id: number, payload: SubmitReviewPayload): Promise<AssignmentReview> => {
    const { data } = await apiClient.post(`${BASE}/${id}/review`, payload);
    return unwrapData<AssignmentReview>({ data }) as AssignmentReview;
  },
} as const;
