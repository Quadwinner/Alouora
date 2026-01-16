/**
 * Product Search Utilities
 *
 * Enhanced search functions for products with category/brand matching
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalize search term - handles singular/plural variations
 */
function normalizeSearchTerm(term: string): string[] {
  const normalized = term.toLowerCase().trim();
  const variations: string[] = [normalized];

  // Add singular form if plural (ends with 's')
  if (normalized.endsWith('s') && normalized.length > 3) {
    variations.push(normalized.slice(0, -1));
  }

  // Add plural form if singular
  if (!normalized.endsWith('s') && normalized.length > 2) {
    variations.push(normalized + 's');
  }

  // Handle 'ies' -> 'y' conversion
  if (normalized.endsWith('ies')) {
    variations.push(normalized.slice(0, -3) + 'y');
  }

  // Handle 'y' -> 'ies' conversion
  if (normalized.endsWith('y') && !normalized.endsWith('ey')) {
    variations.push(normalized.slice(0, -1) + 'ies');
  }

  return [...new Set(variations)];
}

/**
 * Enhanced Product Search
 * Searches across product name, description, SKU, brand name, and category name
 * with support for singular/plural variations
 */
export async function searchProducts(
  supabase: SupabaseClient,
  searchTerm: string,
  baseQuery: any
): Promise<any> {
  const sanitizedTerm = searchTerm.trim();
  const searchVariations = normalizeSearchTerm(sanitizedTerm);

  // Find matching brands and categories (including variations)
  const brandPromises = searchVariations.map(term =>
    supabase
      .from('brands')
      .select('id, name')
      .ilike('name', `%${term}%`)
      .eq('is_active', true)
  );

  const categoryPromises = searchVariations.map(term =>
    supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `%${term}%`)
      .eq('is_active', true)
  );

  const [brandsResults, categoriesResults] = await Promise.all([
    Promise.all(brandPromises),
    Promise.all(categoryPromises)
  ]);

  // Collect unique IDs from all variations
  const matchingBrandIds = [...new Set(
    brandsResults.flatMap(r => r.data?.map(b => b.id) || [])
  )];
  const matchingCategoryIds = [...new Set(
    categoriesResults.flatMap(r => r.data?.map(c => c.id) || [])
  )];

  // Build OR conditions for all variations
  const orConditions: string[] = [];
  
  searchVariations.forEach(term => {
    orConditions.push(`name.ilike.%${term}%`);
    orConditions.push(`description.ilike.%${term}%`);
    orConditions.push(`sku.ilike.%${term}%`);
  });

  // Add category and brand ID matches
  if (matchingCategoryIds.length > 0) {
    orConditions.push(`category_id.in.(${matchingCategoryIds.join(',')})`);
  }
  if (matchingBrandIds.length > 0) {
    orConditions.push(`brand_id.in.(${matchingBrandIds.join(',')})`);
  }

  const searchQuery = baseQuery.or(orConditions.join(','));

  return {
    query: searchQuery,
    matchingBrandIds,
    matchingCategoryIds,
    searchVariations,
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
  const searchVariations = normalizeSearchTerm(sanitizedTerm);

  // Find matching brands and categories to include their products in search
  const brandPromises = searchVariations.map(term =>
    supabase
      .from('brands')
      .select('id')
      .ilike('name', `%${term}%`)
      .eq('is_active', true)
  );

  const categoryPromises = searchVariations.map(term =>
    supabase
      .from('categories')
      .select('id')
      .ilike('name', `%${term}%`)
      .eq('is_active', true)
  );

  const [brandsResults, categoriesResults] = await Promise.all([
    Promise.all(brandPromises),
    Promise.all(categoryPromises)
  ]);

  const matchingBrandIds = [...new Set(
    brandsResults.flatMap(r => r.data?.map(b => b.id) || [])
  )];
  const matchingCategoryIds = [...new Set(
    categoriesResults.flatMap(r => r.data?.map(c => c.id) || [])
  )];

  // Build comprehensive OR conditions for all variations
  const orConditions: string[] = [];
  
  searchVariations.forEach(term => {
    orConditions.push(`name.ilike.%${term}%`);
    orConditions.push(`description.ilike.%${term}%`);
    orConditions.push(`sku.ilike.%${term}%`);
  });

  // Include products from matching categories and brands
  if (matchingCategoryIds.length > 0) {
    orConditions.push(`category_id.in.(${matchingCategoryIds.join(',')})`);
  }
  if (matchingBrandIds.length > 0) {
    orConditions.push(`brand_id.in.(${matchingBrandIds.join(',')})`);
  }

  const searchQuery = baseQuery.or(orConditions.join(','));

  return {
    query: searchQuery,
    brandIds: matchingBrandIds,
    categoryIds: matchingCategoryIds,
    searchVariations,
  };
}

/**
 * Use database function for enhanced search (if available)
 * This provides better ranking, category/brand matching, and performance
 */
export async function searchProductsWithFunction(
  supabase: SupabaseClient,
  searchTerm: string,
  limit: number = 50,
  offset: number = 0
): Promise<any> {
  try {
    // Try enhanced search function first
    const { data: enhancedData, error: enhancedError } = await supabase.rpc('search_products_enhanced', {
      search_term: searchTerm,
      result_limit: limit,
      result_offset: offset
    });

    if (!enhancedError && enhancedData) {
      return enhancedData;
    }

    // Fallback to basic FTS function
    const { data, error } = await supabase.rpc('search_products_fts', {
      search_term: searchTerm,
    });

    if (error) {
      console.warn('Full-text search function not available, using fallback:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Error using full-text search function:', error);
    return null;
  }
}

// Note: normalizeSearchTerm is already defined above (line 12)
