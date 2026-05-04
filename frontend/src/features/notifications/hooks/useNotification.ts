import { useNotifications } from './useNotifications';

export function useNotification(id: number) {
  const { data } = useNotifications();
  return data?.data.data.find((n) => n.id === id) ?? null;
}
