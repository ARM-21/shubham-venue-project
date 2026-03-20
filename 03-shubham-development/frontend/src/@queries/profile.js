import { useQuery } from "@tanstack/react-query";
import { profileMeFetcher } from "@api/profile/profile-me-fetcher";

export function useQueryProfile(options) {
  return useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => profileMeFetcher(),
    ...options,
  });
}
