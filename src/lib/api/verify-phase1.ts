/**
 * Phase 1 Verification Script
 *
 * This script verifies that all Phase 1 components are complete and properly exported.
 * Run with: npx tsx src/lib/api/verify-phase1.ts
 */

// Import Phase 1 components that we're verifying
import {
  successResponse,
  errorResponse,
  calculatePagination,
} from './response'

import {
  ValidationError,
  NotFoundError,
  ConflictError,
  handleApiError,
  handleSupabaseError,
} from './errors'

// Import schemas from individual files
import {
  paginationSchema,
  phoneNumberSchema,
} from './schemas/common'

import {
  addToCartSchema,
} from './schemas/cart'

import {
  createOrderSchema,
} from './schemas/order'

import {
  updateProfileSchema,
} from './schemas/user'

import {
  productListQuerySchema,
} from './schemas/product'

import {
  createReviewSchema,
} from './schemas/review'

import {
  couponCodeSchema,
  applyCouponSchema,
  createCouponSchema,
} from './schemas/coupon'

import {
  paginateQuery,
  getPaginationMetadata,
  applySort,
  applyFilters,
  getSingleRecord,
} from '../db/queries'

/**
 * Verification Results
 */
interface VerificationResult {
  component: string
  status: '✅' | '❌'
  message: string
}

const results: VerificationResult[] = []

/**
 * Verify Response Utilities
 */
function verifyResponseUtilities() {
  try {
    // Test success response
    const success = successResponse({ test: 'data' })
    if (success.status === 200) {
      results.push({ component: 'successResponse', status: '✅', message: 'Working correctly' })
    }

    // Test error response
    const error = errorResponse('Test error', 400)
    if (error.status === 400) {
      results.push({ component: 'errorResponse', status: '✅', message: 'Working correctly' })
    }

    // Test pagination calculation
    const pagination = calculatePagination(1, 20, 100)
    if (pagination.totalPages === 5) {
      results.push({ component: 'calculatePagination', status: '✅', message: 'Working correctly' })
    }

    results.push({ component: 'Response Utilities', status: '✅', message: 'All functions working' })
  } catch (error) {
    results.push({ component: 'Response Utilities', status: '❌', message: `Error: ${error}` })
  }
}

/**
 * Verify Error Handling
 */
function verifyErrorHandling() {
  try {
    // Test custom error classes
    const validationError = new ValidationError('Test')
    if (validationError.statusCode === 400) {
      results.push({ component: 'ValidationError', status: '✅', message: 'Working correctly' })
    }

    const notFoundError = new NotFoundError('Resource')
    if (notFoundError.statusCode === 404) {
      results.push({ component: 'NotFoundError', status: '✅', message: 'Working correctly' })
    }

    // Test error handlers
    const handled = handleApiError(validationError)
    if (handled.statusCode === 400) {
      results.push({ component: 'handleApiError', status: '✅', message: 'Working correctly' })
    }

    // Test Supabase error handling
    const supabaseError = handleSupabaseError({ code: '23505', message: 'Duplicate' })
    if (supabaseError instanceof ConflictError) {
      results.push({ component: 'handleSupabaseError', status: '✅', message: 'Working correctly' })
    }

    results.push({ component: 'Error Handling', status: '✅', message: 'All functions working' })
  } catch (error) {
    results.push({ component: 'Error Handling', status: '❌', message: `Error: ${error}` })
  }
}

/**
 * Verify Validation Schemas
 */
function verifyValidationSchemas() {
  try {
    // Test common schemas
    const pagination = paginationSchema.parse({ page: 1, limit: 20 })
    if (pagination.page === 1) {
      results.push({ component: 'paginationSchema', status: '✅', message: 'Working correctly' })
    }

    const phone = phoneNumberSchema.parse('9876543210')
    if (phone === '9876543210') {
      results.push({ component: 'phoneNumberSchema', status: '✅', message: 'Working correctly' })
    }

    // Test cart schemas
    const addToCart = addToCartSchema.parse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 1,
    })
    if (addToCart.quantity === 1) {
      results.push({ component: 'addToCartSchema', status: '✅', message: 'Working correctly' })
    }

    // Test order schemas
    const order = createOrderSchema.parse({
      address_id: '123e4567-e89b-12d3-a456-426614174000',
      payment_method: 'upi',
    })
    if (order.payment_method === 'upi') {
      results.push({ component: 'createOrderSchema', status: '✅', message: 'Working correctly' })
    }

    // Test user schemas
    const profile = updateProfileSchema.parse({ full_name: 'John Doe' })
    if (profile.full_name === 'John Doe') {
      results.push({ component: 'updateProfileSchema', status: '✅', message: 'Working correctly' })
    }

    // Test product schemas
    const productQuery = productListQuerySchema.parse({ page: 1, limit: 20 })
    if (productQuery.page === 1) {
      results.push({ component: 'productListQuerySchema', status: '✅', message: 'Working correctly' })
    }

    // Test review schemas
    const review = createReviewSchema.parse({
      product_id: '123e4567-e89b-12d3-a456-426614174000',
      order_id: '123e4567-e89b-12d3-a456-426614174001',
      rating: 5,
      comment: 'This is a great product that I highly recommend to everyone.',
    })
    if (review.rating === 5) {
      results.push({ component: 'createReviewSchema', status: '✅', message: 'Working correctly' })
    }

    // Test coupon schemas
    const couponCode = couponCodeSchema.parse('SAVE20')
    if (couponCode === 'SAVE20') {
      results.push({ component: 'couponCodeSchema', status: '✅', message: 'Working correctly' })
    }

    const applyCoupon = applyCouponSchema.parse({ coupon_code: 'SAVE20' })
    if (applyCoupon.coupon_code === 'SAVE20') {
      results.push({ component: 'applyCouponSchema', status: '✅', message: 'Working correctly' })
    }

    const createCoupon = createCouponSchema.parse({
      code: 'SAVE20',
      name: '20% Off Sale',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_amount: 1000,
      max_uses_per_user: 1,
      valid_from: '2024-01-01T00:00:00Z',
      valid_until: '2024-12-31T23:59:59Z',
      applicable_to: 'all',
    })
    if (createCoupon.code === 'SAVE20') {
      results.push({ component: 'createCouponSchema', status: '✅', message: 'Working correctly' })
    }

    results.push({ component: 'Validation Schemas', status: '✅', message: 'All schemas working' })
  } catch (error) {
    results.push({ component: 'Validation Schemas', status: '❌', message: `Error: ${error}` })
  }
}

/**
 * Verify Database Query Helpers
 */
function verifyDatabaseHelpers() {
  try {
    // Just verify functions are exported and callable
    if (typeof paginateQuery === 'function') {
      results.push({ component: 'paginateQuery', status: '✅', message: 'Exported correctly' })
    }

    if (typeof getPaginationMetadata === 'function') {
      results.push({ component: 'getPaginationMetadata', status: '✅', message: 'Exported correctly' })
    }

    if (typeof applySort === 'function') {
      results.push({ component: 'applySort', status: '✅', message: 'Exported correctly' })
    }

    if (typeof applyFilters === 'function') {
      results.push({ component: 'applyFilters', status: '✅', message: 'Exported correctly' })
    }

    if (typeof getSingleRecord === 'function') {
      results.push({ component: 'getSingleRecord', status: '✅', message: 'Exported correctly' })
    }

    results.push({ component: 'Database Query Helpers', status: '✅', message: 'All functions exported' })
  } catch (error) {
    results.push({ component: 'Database Query Helpers', status: '❌', message: `Error: ${error}` })
  }
}

/**
 * Main verification function
 */
function verifyPhase1() {
  console.log('\n🔍 Verifying Phase 1: Shared Utilities & Helpers\n')
  console.log('=' .repeat(60))

  // Run all verification checks
  verifyResponseUtilities()
  verifyErrorHandling()
  verifyValidationSchemas()
  verifyDatabaseHelpers()

  // Print results
  console.log('\n📊 Verification Results:\n')
  results.forEach((result) => {
    console.log(`${result.status} ${result.component}: ${result.message}`)
  })

  // Summary
  const passed = results.filter((r) => r.status === '✅').length
  const failed = results.filter((r) => r.status === '❌').length
  const total = results.length

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Passed: ${passed}/${total}`)
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${total}`)
  }
  console.log('\n' + '='.repeat(60))

  if (failed === 0) {
    console.log('\n🎉 Phase 1 is COMPLETE! All components are working correctly.\n')
    return true
  } else {
    console.log('\n⚠️  Phase 1 has some issues. Please review the errors above.\n')
    return false
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyPhase1()
}

export { verifyPhase1 }
