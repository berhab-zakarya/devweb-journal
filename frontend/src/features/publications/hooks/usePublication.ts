import { useQuery } from '@tanstack/react-query';
import { publicationsDetailQueryOptions } from '../queries/publications.queries';

export function usePublication(id: number) {
  return useQuery(publicationsDetailQueryOptions(id));
}
