export type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

export type PaginationLinks = {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
};

export type NormalizedPaginatedList<T> = {
  items: T[];
  meta?: PaginationMeta;
  links?: PaginationLinks;
};

export type ApiCollectionResponse<T> = {
  data?: T[] | { data?: T[]; meta?: PaginationMeta; links?: PaginationLinks };
  meta?: PaginationMeta;
  links?: PaginationLinks;
};

export type ApiPaginatorResponse<T> = {
  data?: {
    data?: T[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number | null;
    to?: number | null;
    first_page_url?: string | null;
    last_page_url?: string | null;
    next_page_url?: string | null;
    prev_page_url?: string | null;
    path?: string;
  } | T[];
  meta?: PaginationMeta;
  links?: PaginationLinks;
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

export function unwrapData<T>(response: { data?: T | { data?: T } }): T | undefined {
  const payload = response.data;
  if (!payload) return undefined;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data?: T }).data;
  }
  return payload as T;
}

export function normalizeSimpleCollection<T>(response: ApiCollectionResponse<T>): T[] {
  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

export function normalizeLaravelPaginator<T>(response: ApiPaginatorResponse<T>): NormalizedPaginatedList<T> {
  const payload = response.data;

  // Shape 1: response.data is a plain array
  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: response.meta,
      links: response.links,
    };
  }

  if (payload && typeof payload === 'object') {
    // Shape 2: { data: T[], meta?: {...} } — Laravel ResourceCollection / unwrapped paginator
    if (Array.isArray(payload.data)) {
      return {
        items: payload.data,
        meta: payload.meta ?? response.meta ?? normalizeMeta(payload),
        links: payload.links ?? response.links,
      };
    }

    // Shape 3: { data: { current_page: n, data: T[], total: n, ... } }
    // Laravel paginator wrapped in an outer "data" key by the API resource layer.
    // payload.data is the paginator object (not an array), whose own .data holds the items.
    const raw = payload as unknown as Record<string, unknown>;
    const inner = raw.data;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const innerRecord = inner as Record<string, unknown>;
      if (Array.isArray(innerRecord.data)) {
        return {
          items: innerRecord.data as T[],
          meta:
            (innerRecord.meta as PaginationMeta | undefined) ??
            normalizeMeta(innerRecord),
          links:
            (innerRecord.links as PaginationLinks | undefined) ??
            response.links,
        };
      }
    }
  }

  return {
    items: [],
    meta: response.meta,
    links: response.links,
  };
}

function normalizeMeta(payload: Record<string, unknown>): PaginationMeta | undefined {
  const current_page = asNumber(payload.current_page);
  const last_page = asNumber(payload.last_page);
  const per_page = asNumber(payload.per_page);
  const total = asNumber(payload.total);
  const from = asNullableNumber(payload.from);
  const to = asNullableNumber(payload.to);

  if (
    current_page === undefined &&
    last_page === undefined &&
    per_page === undefined &&
    total === undefined &&
    from === undefined &&
    to === undefined
  ) {
    return undefined;
  }

  return {
    current_page,
    last_page,
    per_page,
    total,
    from,
    to,
  };
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asNullableNumber(value: unknown): number | null | undefined {
  if (typeof value === 'number') return value;
  if (value === null) return null;
  return undefined;
}
