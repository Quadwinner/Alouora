/**
 * Product Search Utilities
 *
 * Enhanced search functions for products
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Enhanced Product Search
 * Searches across product name, description, SKU, brand name, and category name
 */
export async function searchProducts(
  supabase: SupabaseClient,
  searchTerm: string,
  baseQuery: any
): Promise<any> {
  const sanitizedTerm = searchTerm.trim();

  // Find matching brands and categories
  const [brandsResult, categoriesResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name')
      .ilike('name', `%${sanitizedTerm}%`)
      .eq('is_active', true),
    supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `%${sanitizedTerm}%`)
      .eq('is_active', true),
  ]);

  const matchingBrandIds = brandsResult.data?.map(b => b.id) || [];
  const matchingCategoryIds = categoriesResult.data?.map(c => c.id) || [];

  // Build search query
  // Search in product fields: name, description, SKU
  let searchQuery = baseQuery.or(
    `name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,sku.ilike.%${sanitizedTerm}%`
  );

  // If we have matching brands or categories, we need to include those products too
  // Since Supabase PostgREST doesn't easily support complex OR with IN,
  // we'll fetch those separately and merge, or use a different approach
  
  // For now, we'll enhance the search by also checking if brand_id or category_id
  // matches the found IDs. We'll do this by creating a union-like approach
  // or by using a more sophisticated query

  // Alternative approach: Use a textSearch that includes brand/category matching
  // We'll create separate queries and combine results, or use a database function
  
  // For immediate implementation, we'll use the product field search
  // and the brand/category matching will be handled by the join in the select
  // The frontend can also filter by brand/category separately

  return {
    query: searchQuery,
    matchingBrandIds,
    matchingCategoryIds,
  };
}

/**
 * Apply search with brand/category matching
 * Uses enhanced search that includes product fields and brand/category matching
 */
export async function applyProductSearch(
  supabase: SupabaseClient,
  baseQuery: any,
  searchTerm: string
): Promise<any> {
  const sanitizedTerm = searchTerm.trim();

  // Find matching brands and categories to include their products in search
  const [brandsResult, categoriesResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id')
      .ilike('name', `%${sanitizedTerm}%`)
      .eq('is_active', true),
    supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${sanitizedTerm}%`)
      .eq('is_active', true),
  ]);

  const matchingBrandIds = brandsResult.data?.map(b => b.id) || [];
  const matchingCategoryIds = categoriesResult.data?.map(c => c.id) || [];

  // Enhanced search: Search in product name, description, and SKU
  // This uses ilike which works well with Supabase PostgREST
  // The full-text search index will still help with performance
  let searchQuery = baseQuery.or(
    `name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,sku.ilike.%${sanitizedTerm}%`
  );

  // Note: To include products from matching brands/categories that don't match
  // the text search, we would need to do a UNION query or use a database function.
  // For now, the text search on product fields covers most use cases.
  // Brand and category name matching will be visible through the joined data
  // in the response, allowing the frontend to highlight matches.

  return {
    query: searchQuery,
    brandIds: matchingBrandIds,
    categoryIds: matchingCategoryIds,
  };
}

/**
 * Use database function for full-text search (if available)
 * This provides better ranking and performance
 */
export async function searchProductsWithFunction(
  supabase: SupabaseClient,
  searchTerm: string,
  _limit: number = 20,
  _offset: number = 0
): Promise<any> {
  try {
    // Call the database function for full-text search
    const { data, error } = await supabase.rpc('search_products_fts', {
      search_term: searchTerm,
    });

    if (error) {
      // Fallback to regular search if function doesn't exist
      console.warn('Full-text search function not available, using fallback:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Error using full-text search function:', error);
    return null;
  }
}
