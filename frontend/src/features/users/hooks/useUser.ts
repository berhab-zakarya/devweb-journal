import { useUsers } from './useUsers';

export function useUser(id: number) {
  const { data } = useUsers();
  return data?.items?.find((u) => u.id === id) ?? null;
}
