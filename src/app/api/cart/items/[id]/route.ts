import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for updating cart item
const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
});

// PUT /api/cart/items/[id] - Update cart item quantity
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in' },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = updateCartItemSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: validationResult.error.issues.map(e => e.message)
                },
                { status: 400 }
            );
        }

        const { quantity } = validationResult.data;

        // Get cart item with product info
        const { data: cartItem, error: cartError } = await supabase
            .from('cart_items')
            .select(`
        id,
        user_id,
        product_id,
        product:products (
          id,
          price,
          original_price,
          stock_quantity,
          is_active
        )
      `)
            .eq('id', id)
            .single();

        if (cartError || !cartItem) {
            return NextResponse.json(
                { success: false, error: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (cartItem.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const product = (Array.isArray(cartItem.product) ? cartItem.product[0] : cartItem.product) as {
            id: string;
            price: number;
            original_price: number | null;
            stock_quantity: number;
            is_active: boolean;
        };

        // Check if product is still active
        if (!product.is_active) {
            return NextResponse.json(
                { success: false, error: 'This product is no longer available' },
                { status: 400 }
            );
        }

        // Check stock availability
        if (quantity > product.stock_quantity) {
            return NextResponse.json(
                { success: false, error: `Only ${product.stock_quantity} items available in stock` },
                { status: 400 }
            );
        }

        // Update cart item (price is the current/sale price)
        const priceSnapshot = product.price;

        const { error: updateError } = await supabase
            .from('cart_items')
            .update({
                quantity,
                price: priceSnapshot,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating cart item:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update cart' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cart updated successfully',
            data: { quantity, priceSnapshot }
        });
    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// DELETE /api/cart/items/[id] - Remove item from cart
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in' },
                { status: 401 }
            );
        }

        // Get cart item to verify ownership
        const { data: cartItem, error: cartError } = await supabase
            .from('cart_items')
            .select('id, user_id')
            .eq('id', id)
            .single();

        if (cartError || !cartItem) {
            return NextResponse.json(
                { success: false, error: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (cartItem.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete cart item
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting cart item:', deleteError);
            return NextResponse.json(
                { success: false, error: 'Failed to remove item from cart' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
