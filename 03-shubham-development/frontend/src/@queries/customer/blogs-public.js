import { useQuery } from "@tanstack/react-query";
import { BLOGS_PUBLIC_QUERY_KEY, blogsPublicFetcher } from "@api/customer/blogs-public-fetcher";

export function useQueryBlogsPublic(params = {}, options) {
  const { blogHandle = 'news', first = 10, after = null } = params;
  
  return useQuery({
    queryKey: [BLOGS_PUBLIC_QUERY_KEY, blogHandle, first, after],
    queryFn: async () => blogsPublicFetcher({ blogHandle, first, after }),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000,     // 30 minutes cache
    ...options,
  });
}
