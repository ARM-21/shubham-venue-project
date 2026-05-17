import { fetchBlogs } from "services/shopifyService";

export const BLOGS_PUBLIC_QUERY_KEY = "blogs-public";

export async function blogsPublicFetcher(params = {}) {
  const { blogHandle = 'news', first = 10, after = null } = params;
  try {
    const result = await fetchBlogs(blogHandle, first, after);
    return result;
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    throw error;
  }
}
