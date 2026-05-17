/**
 * Shopify Storefront API Service
 * Handles fetching blogs and related content from Shopify
 * This is a server-side service
 */

'use server';

const STORE_NAME = process.env.SHOPIFY_STORE_NAME;
const SHOPIFY_ENDPOINT = `https://${STORE_NAME}.myshopify.com/api/2024-01/graphql.json`;
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const BLOGS_PER_PAGE = parseInt(process.env.SHOPIFY_BLOGS_PER_PAGE) || 5;

/**
 * Execute GraphQL query against Shopify Storefront API
 */
async function executeShopifyQuery(query, variables = {}) {
  try {
    // Debug: Log environment variables (remove in production)
    if (!SHOPIFY_TOKEN || !SHOPIFY_ENDPOINT) {
      throw new Error('Missing Shopify credentials: SHOPIFY_STORE_NAME or SHOPIFY_STOREFRONT_TOKEN');
    }

    console.log('🔵 Shopify API Request:');
    console.log('Endpoint:', SHOPIFY_ENDPOINT);
    console.log('Variables:', variables);
    console.log('Query:', query.substring(0, 150) + '...');

    const response = await fetch(SHOPIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    console.log('📡 Shopify API Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('❌ Error Response Body:', errorData);
      throw new Error(`Shopify API Error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    
    console.log('📥 Shopify API Response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('❌ Shopify GraphQL Errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL Error');
    }

    return data.data;
  } catch (error) {
    console.error('❌ Shopify Service Error:', error);
    throw error;
  }
}

/**
 * Fetch all blogs from Shopify
 * Directly fetch articles from a specific blog handle
 */
export async function fetchBlogs(blogHandle = 'news', first = BLOGS_PER_PAGE, after = null) {
  const query = `
    query FetchBlogArticles($blogHandle: String!, $first: Int!, $after: String) {
      blogByHandle(handle: $blogHandle) {
        id
        title
        articles(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              id
              title
              handle
              excerpt
              contentHtml
              publishedAt
              image {
                url
                altText
              }
              author {
                name
                email
              }
            }
            cursor
          }
        }
      }
    }
  `;

  try {
    const data = await executeShopifyQuery(query, { blogHandle, first, after });
    
    // Debug logging
    console.log('✅ Blog articles data received:', data);
    
    if (!data.blogByHandle) {
      console.error(`Blog "${blogHandle}" not found`);
      return {
        blogs: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        error: `Blog "${blogHandle}" not found`,
      };
    }
    
    return {
      blogs: data.blogByHandle.articles.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        excerpt: edge.node.excerpt,
        contentHtml: edge.node.contentHtml,
        publishedAt: new Date(edge.node.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        image: edge.node.image || null,
        author: edge.node.author,
      })),
      pageInfo: data.blogByHandle.articles.pageInfo,
      blogTitle: data.blogByHandle.title,
    };
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return {
      blogs: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      error: error.message,
    };
  }
}

/**
 * Fetch articles from a specific blog
 */
export async function fetchBlogArticles(blogHandle, first = BLOGS_PER_PAGE, after = null) {
  const query = `
    query FetchBlogArticles($blogHandle: String!, $first: Int!, $after: String) {
      blogByHandle(handle: $blogHandle) {
        id
        title
        articles(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
          }
          edges {
            node {
              id
              title
              handle
              excerpt
              contentHtml
              publishedAt
              image {
                url
                altText
              }
              author {
                name
                email
              }
            }
            cursor
          }
        }
      }
    }
  `;

  try {
    const data = await executeShopifyQuery(query, {
      blogHandle,
      first,
      after,
    });

    if (!data.blogByHandle) {
      throw new Error(`Blog "${blogHandle}" not found`);
    }

    return {
      blog: {
        id: data.blogByHandle.id,
        title: data.blogByHandle.title,
      },
      articles: data.blogByHandle.articles.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        excerpt: edge.node.excerpt,
        contentHtml: edge.node.contentHtml,
        publishedAt: new Date(edge.node.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        image: edge.node.image || null,
        author: edge.node.author,
      })),
      pageInfo: data.blogByHandle.articles.pageInfo,
    };
  } catch (error) {
    console.error('Failed to fetch blog articles:', error);
    return {
      blog: null,
      articles: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      error: error.message,
    };
  }
}

/**
 * Fetch a single article
 */
export async function fetchBlogArticle(blogHandle, articleHandle) {
  const query = `
    query FetchBlogArticle($blogHandle: String!, $articleHandle: String!) {
      blogByHandle(handle: $blogHandle) {
        id
        title
        articleByHandle(handle: $articleHandle) {
          id
          title
          handle
          body
          excerpt
          contentHtml
          publishedAt
          image {
            url
            altText
          }
          author {
            name
            email
          }
        }
      }
    }
  `;

  try {
    const data = await executeShopifyQuery(query, {
      blogHandle,
      articleHandle,
    });

    if (!data.blogByHandle?.articleByHandle) {
      throw new Error('Article not found');
    }

    const article = data.blogByHandle.articleByHandle;
    return {
      blog: {
        id: data.blogByHandle.id,
        title: data.blogByHandle.title,
      },
      article: {
        id: article.id,
        title: article.title,
        handle: article.handle,
        body: article.body,
        excerpt: article.excerpt,
        contentHtml: article.contentHtml,
        publishedAt: new Date(article.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        image: article.image || null,
        author: article.author,
      },
    };
  } catch (error) {
    console.error('Failed to fetch blog article:', error);
    return {
      blog: null,
      article: null,
      error: error.message,
    };
  }
}

/**
 * Search articles across blogs
 */
export async function searchBlogArticles(query, first = BLOGS_PER_PAGE) {
  const graphqlQuery = `
    query SearchArticles($query: String!, $first: Int!) {
      articles(first: $first, query: $query) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        edges {
          node {
            id
            title
            handle
            excerpt
            image {
              url
              altText
            }
            blog {
              handle
              title
            }
            publishedAt
          }
          cursor
        }
      }
    }
  `;

  try {
    const data = await executeShopifyQuery(graphqlQuery, { query, first });
    return {
      articles: data.articles.edges.map(edge => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        excerpt: edge.node.excerpt,
        image: edge.node.image || null,
        blog: edge.node.blog,
        publishedAt: new Date(edge.node.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })),
      pageInfo: data.articles.pageInfo,
    };
  } catch (error) {
    console.error('Failed to search articles:', error);
    return {
      articles: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      error: error.message,
    };
  }
}
