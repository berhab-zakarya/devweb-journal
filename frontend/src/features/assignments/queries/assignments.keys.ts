export const assignmentsKeys = {
  all: ['assignments'] as const,
  details: () => [...assignmentsKeys.all, 'detail'] as const,
  detail: (id: number) => [...assignmentsKeys.details(), id] as const,
  review: (id: number) => [...assignmentsKeys.all, 'review', id] as const,
} as const;
