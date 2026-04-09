import { useQuery } from "@tanstack/react-query";
import {
  USER_UPLOADS_QUERY_KEY,
  userUploadsFetcher,
} from "@api/organizer/user-uploads-fetcher";

/**
 * Fetch user's uploaded images by type (banner, menu, decoration, avatar)
 * Uses React Query for caching and automatic deduplication
 */
export function useQueryUserUploads(type = "banner", options) {
  return useQuery({
    queryKey: [USER_UPLOADS_QUERY_KEY, type],
    queryFn: () => userUploadsFetcher(type),
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
