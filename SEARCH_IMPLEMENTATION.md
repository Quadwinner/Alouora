# Product Search Implementation Guide

## How Product Search Works

### Overview
The product search uses PostgreSQL's `ILIKE` pattern matching combined with full-text search infrastructure for fast and flexible product discovery.

### Search Flow

```
User Query → API Endpoint → Validation → Database Query → Results
```

### 1. API Endpoint
**Route**: `GET /api/products?search=lipstick`

**Query Parameters**:
- `search` or `q` - Search term (required for search)
- `category` - Filter by category (UUID or slug)
- `brand` - Filter by brand (UUID or slug, can be array)
- `minPrice` / `maxPrice` - Price range filter
- `rating` - Minimum rating filter
- `sort` - Sort order (popularity, price_low_to_high, price_high_to_low, newest, rating, discount)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)
- `inStock` - Only show in-stock products
- `featured` - Only show featured products

### 2. Search Implementation

#### Current Implementation (Simple & Fast)
```typescript
// In src/app/api/products/route.ts (line 301-309)
if (searchTerm) {
  const sanitizedTerm = searchTerm.trim();
  
  // Search in product name, description, and SKU
  baseQuery = baseQuery.or(
    `name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,sku.ilike.%${sanitizedTerm}%`
  );
}
```

**How it works**:
- Uses PostgreSQL `ILIKE` for case-insensitive pattern matching
- Searches across 3 fields: `name`, `description`, `sku`
- Uses `%term%` pattern for partial matching (finds "lipstick" in "Ruby Woo Lipstick")
- The `OR` operator means it matches if ANY field contains the search term

**Example Query**:
```sql
SELECT * FROM products 
WHERE is_active = true
  AND (
    name ILIKE '%lipstick%' 
    OR description ILIKE '%lipstick%' 
    OR sku ILIKE '%lipstick%'
  )
ORDER BY sales_count DESC
LIMIT 20 OFFSET 0;
```

### 3. Database Infrastructure

#### Full-Text Search Index (Available but not currently used)
The database has a `search_document` column with GIN index for advanced full-text search:

```sql
-- search_document column (tsvector type)
-- Automatically updated when product name/description/SKU changes
-- Weighted: name (A), description (B), SKU (C)

-- GIN Index for fast searches
CREATE INDEX idx_products_search_document ON products USING gin(search_document);
```

#### Database Function (Available for future use)
```sql
-- Function: search_products_fts(search_term TEXT)
-- Returns products with relevance ranking
-- Can be called via: supabase.rpc('search_products_fts', { search_term: 'lipstick' })
```

### 4. Search Features

#### ✅ Currently Working
- **Multi-field search**: Searches name, description, and SKU simultaneously
- **Case-insensitive**: "LIPSTICK" matches "lipstick"
- **Partial matching**: "lip" matches "lipstick"
- **Combined with filters**: Can combine search with category, brand, price filters
- **Sorting**: Results can be sorted by popularity, price, rating, etc.
- **Pagination**: Supports pagination for large result sets

#### 🔄 Available but Not Used (Future Enhancement)
- **Full-text search ranking**: Database function provides relevance scores
- **Weighted search**: Name matches ranked higher than description matches
- **Stemming**: PostgreSQL full-text search handles word variations (e.g., "run" matches "running")

### 5. Search Examples

#### Basic Search
```
GET /api/products?search=lipstick
```
Searches for "lipstick" in name, description, and SKU.

#### Search with Filters
```
GET /api/products?search=red&category=lipstick&minPrice=500&maxPrice=2000&sort=price_low_to_high
```
Searches for "red" in lipstick category, price range ₹500-₹2000, sorted by price.

#### Search with Pagination
```
GET /api/products?search=beauty&page=2&limit=20
```
Gets page 2 of search results (20 products per page).

### 6. Performance

#### Current Implementation
- **Fast**: Uses indexed columns (name, description have indexes)
- **Simple**: Easy to understand and maintain
- **Scalable**: Works well with thousands of products

#### Full-Text Search (When Enabled)
- **Faster**: GIN index is optimized for text search
- **Better ranking**: Relevance-based results
- **Advanced**: Handles word variations and synonyms

### 7. Response Format

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "...",
        "name": "Ruby Woo Lipstick",
        "slug": "ruby-woo-lipstick",
        "price": 23.00,
        "rating_average": 4.9,
        "brand": { "id": "...", "name": "MAC", "slug": "mac" },
        "category": { "id": "...", "name": "Lipstick", "slug": "lipstick" }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true
    },
    "filters": {
      "categories": [...],
      "brands": [...],
      "priceRange": { "min": 100, "max": 5000 },
      "ratings": [...]
    }
  }
}
```

### 8. How to Enhance Search (Future)

To use the full-text search function:

```typescript
// In src/app/api/products/route.ts
if (searchTerm) {
  // Option 1: Use database function for ranked results
  const { data: ftsResults } = await supabase.rpc('search_products_fts', {
    search_term: searchTerm
  });
  
  // Option 2: Use search_document column directly
  baseQuery = baseQuery.textSearch('search_document', searchTerm, {
    type: 'plain',
    config: 'english'
  });
}
```

### Summary

**Current Search**: Simple, fast, and works well for most use cases
- Uses `ILIKE` pattern matching
- Searches name, description, SKU
- Case-insensitive and partial matching
- Combined with filters and sorting

**Available Infrastructure**: Ready for advanced search when needed
- Full-text search index (GIN)
- Search document column (auto-updated)
- Database function with relevance ranking

The search is production-ready and performs well with the current implementation!
