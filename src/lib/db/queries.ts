/**
 * Database Query Helpers
 *
 * Reusable query utilities for common database operations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { PaginationMeta } from '../api/response'
import { calculatePagination } from '../api/response'

/**
 * Paginate Query
 * Applies pagination to a Supabase query
 */
export function paginateQuery(
  query: any,
  page: number = 1,
  limit: number = 20
): any {
  const from = (page - 1) * limit
  const to = from + limit - 1

  return query.range(from, to)
}

/**
 * Get Pagination Metadata
 * Fetches total count and calculates pagination metadata
 */
export async function getPaginationMetadata(
  query: any,
  page: number,
  limit: number
): Promise<PaginationMeta> {
  const { count } = await query.select('*', { count: 'exact', head: true })
  const total = count || 0

  return calculatePagination(page, limit, total)
}

/**
 * Execute Paginated Query
 * Executes a query with pagination and returns data + metadata
 */
export async function executePaginatedQuery<T>(
  query: any,
  page: number = 1,
  limit: number = 20
): Promise<{ data: T[]; pagination: PaginationMeta }> {
  // Get total count
  const { count } = await query.select('*', { count: 'exact', head: true })
  const total = count || 0

  // Execute paginated query
  const paginatedQuery = paginateQuery(query, page, limit)
  const { data, error } = await paginatedQuery

  if (error) throw error

  return {
    data: data || [],
    pagination: calculatePagination(page, limit, total),
  }
}

/**
 * Apply Sorting
 * Applies sorting to a Supabase query
 */
export function applySort(
  query: any,
  sortBy: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): any {
  return query.order(sortBy, { ascending: sortOrder === 'asc' })
}

/**
 * Apply Filters
 * Applies multiple filters to a query
 */
export function applyFilters(query: any, filters: Record<string, any>): any {
  let filteredQuery = query

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle array filters (IN operator)
        filteredQuery = filteredQuery.in(key, value)
      } else {
        // Handle equality filters
        filteredQuery = filteredQuery.eq(key, value)
      }
    }
  })

  return filteredQuery
}

/**
 * Apply Range Filter
 * Applies a range filter (min/max) to a query
 */
export function applyRangeFilter(
  query: any,
  field: string,
  min?: number,
  max?: number
): any {
  let rangeQuery = query

  if (min !== undefined) {
    rangeQuery = rangeQuery.gte(field, min)
  }

  if (max !== undefined) {
    rangeQuery = rangeQuery.lte(field, max)
  }

  return rangeQuery
}

/**
 * Search Query
 * Applies full-text search to a query
 */
export function applySearch(
  query: any,
  searchField: string,
  searchTerm: string
): any {
  // Using ilike for case-insensitive search
  return query.ilike(searchField, `%${searchTerm}%`)
}

/**
 * Get Single Record
 * Fetches a single record by ID with error handling
 */
export async function getSingleRecord<T>(
  supabase: SupabaseClient,
  table: string,
  id: string,
  select: string = '*'
): Promise<T | null> {
  const { data, error } = await supabase
    .from(table)
    .select(select)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw error
  }

  return data as T
}

/**
 * Check if Record Exists
 * Checks if a record exists by ID
 */
export async function recordExists(
  supabase: SupabaseClient,
  table: string,
  id: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('id', id)

  if (error) throw error

  return (count || 0) > 0
}

/**
 * Soft Delete Record
 * Marks a record as deleted (if table has is_active column)
 */
export async function softDeleteRecord(
  supabase: SupabaseClient,
  table: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

/**
 * Transaction Helper
 * Executes multiple operations in a transaction-like manner
 * Note: Supabase doesn't support transactions directly, but RLS policies provide safety
 */
export async function executeInTransaction<T>(
  operations: Array<() => Promise<any>>
): Promise<T[]> {
  const results: T[] = []

  for (const operation of operations) {
    const result = await operation()
    results.push(result)
  }

  return results
}

/**
 * Batch Insert
 * Inserts multiple records at once
 */
export async function batchInsert<T>(
  supabase: SupabaseClient,
  table: string,
  records: T[]
): Promise<T[]> {
  const { data, error } = await supabase.from(table).insert(records).select()

  if (error) throw error

  return data || []
}

/**
 * Batch Update
 * Updates multiple records based on a filter
 */
export async function batchUpdate<T>(
  supabase: SupabaseClient,
  table: string,
  updates: Partial<T>,
  filter: Record<string, any>
): Promise<void> {
  let query = supabase.from(table).update(updates)

  // Apply filters
  Object.entries(filter).forEach(([key, value]) => {
    query = query.eq(key, value)
  })

  const { error } = await query

  if (error) throw error
}
