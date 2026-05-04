import { useUsers } from './useUsers';

export function useUser(id: number) {
  const { data } = useUsers();
  return data?.data.find((u) => u.id === id) ?? null;
}
