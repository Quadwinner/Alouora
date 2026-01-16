/**
 * Wishlist Item API
 *
 * DELETE /api/wishlist/[id] - Remove item from wishlist
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from '@/lib/api/response';

/**
 * DELETE /api/wishlist/[id] - Remove item from wishlist
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorizedResponse('Please sign in to remove items from wishlist');
    }

    // Validate ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return errorResponse('Invalid wishlist item ID', 400);
    }

    // Get wishlist item to verify ownership (RLS will handle this, but we check for better error)
    const { data: wishlistItem, error: fetchError } = await supabase
      .from('wishlist')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !wishlistItem) {
      return notFoundResponse('Wishlist item not found');
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (wishlistItem.user_id !== user.id) {
      return errorResponse('Unauthorized', 403);
    }

    // Delete wishlist item
    const { error: deleteError } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting wishlist item:', deleteError);
      return errorResponse('Failed to remove item from wishlist', 500);
    }

    return successResponse(null, 'Item removed from wishlist');
  } catch (error) {
    console.error('Wishlist API error:', error);
    return errorResponse('Internal server error', 500);
  }
}
