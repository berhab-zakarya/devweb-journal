import { useCategories } from './useCategories';

export function useCategory(id: number) {
  const { data: categories = [] } = useCategories();
  return categories.find((c) => c.id === id) ?? null;
}
