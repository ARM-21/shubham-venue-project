import { useQuery } from "@tanstack/react-query";
import { profileMeFetcher } from "@api/profile/profile-me-fetcher";

export const PROFILE_MY_QUERY_KEY = "profile-my";

export function useQueryProfileMy(options) {
  return useQuery({
    queryKey: [PROFILE_MY_QUERY_KEY],
    queryFn: async () => profileMeFetcher(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    ...options,
  });
}
