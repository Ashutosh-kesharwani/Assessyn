// ─── Limits ───────────────────────────────────────────────────────────────────
export const MAX_PAGE     = 50;   // Adzuna hard limit
export const DEFAULT_PAGE = 1;
export const DEFAULT_SIZE = 20;
export const MAX_SIZE     = 50;

// ─── Core Builders ────────────────────────────────────────────────────────────

export function buildPaginationMeta({ totalCount = 0, page = DEFAULT_PAGE, resultsPerPage = DEFAULT_SIZE } = {}) {
  const safePage    = Math.max(1, Math.min(Number(page) || DEFAULT_PAGE, MAX_PAGE));
  const safeSize    = Math.max(1, Math.min(Number(resultsPerPage) || DEFAULT_SIZE, MAX_SIZE));
  const totalPages  = safeSize > 0 ? Math.ceil(totalCount / safeSize) : 0;
  const hasNextPage = safePage < totalPages && safePage < MAX_PAGE;
  const hasPrevPage = safePage > 1;

  return {
    page          : safePage,
    resultsPerPage: safeSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage : hasNextPage ? safePage + 1 : null,
    prevPage : hasPrevPage ? safePage - 1 : null,
  };
}

export function slicePage(items, { page = DEFAULT_PAGE, resultsPerPage = DEFAULT_SIZE, totalCount } = {}) {
  const safeSize   = Math.max(1, Math.min(Number(resultsPerPage) || DEFAULT_SIZE, MAX_SIZE));
  const safePage   = Math.max(1, Math.min(Number(page) || DEFAULT_PAGE, MAX_PAGE));
  const count      = totalCount ?? items.length;
  const start      = (safePage - 1) * safeSize;
  const end        = start + safeSize;

  return {
    items: items.slice(start, end),
    meta : buildPaginationMeta({ totalCount: count, page: safePage, resultsPerPage: safeSize }),
  };
}

export function sanitizePaginationParams(query = {}) {
  return {
    page   : Math.max(1, Math.min(parseInt(query.page,    10) || DEFAULT_PAGE, MAX_PAGE)),
    results: Math.max(1, Math.min(parseInt(query.results, 10) || DEFAULT_SIZE, MAX_SIZE)),
  };
}

export default {
  buildPaginationMeta,
  slicePage,
  sanitizePaginationParams,
  MAX_PAGE,
  DEFAULT_PAGE,
  DEFAULT_SIZE,
  MAX_SIZE,
};
