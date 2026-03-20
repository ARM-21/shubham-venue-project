import { useQuery } from "@tanstack/react-query";
import { menuDetailFetcher } from "@api/menu/menu-detail-fetcher";
import { menuBySlugFetcher } from "@api/menu/menu-by-slug-fetcher";

export function useQueryMenu(id, options) {
  return useQuery({
    queryKey: ["admin-menu", id],
    queryFn: async () => menuDetailFetcher(id),
    enabled: !!id,
    ...options,
  });
}

export function useQueryMenuBySlug(slug, options) {
  return useQuery({
    queryKey: ["menu-by-slug", slug],
    queryFn: async () => menuBySlugFetcher(slug),
    enabled: !!slug,
    ...options,
  });
}
