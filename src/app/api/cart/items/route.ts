import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for adding item to cart
const addToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID').optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum quantity is 10'),
});

// POST /api/cart/items - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in to add items to cart' },
                { status: 401 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = addToCartSchema.safeParse(body);

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

        const { productId, variantId, quantity } = validationResult.data;

        // Check if product exists and is active
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, price, original_price, is_active, stock_quantity')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        if (!product.is_active) {
            return NextResponse.json(
                { success: false, error: 'This product is currently unavailable' },
                { status: 400 }
            );
        }

        // Check stock availability
        if (product.stock_quantity < quantity) {
            return NextResponse.json(
                { success: false, error: `Only ${product.stock_quantity} items available in stock` },
                { status: 400 }
            );
        }

        // Check if item already exists in cart
        let existingCartItem = null;
        const cartQuery = supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (variantId) {
            cartQuery.eq('variant_id', variantId);
        } else {
            cartQuery.is('variant_id', null);
        }

        const { data: existingItems } = await cartQuery;
        existingCartItem = existingItems?.[0] || null;

        // Calculate price to snapshot (price is the current/sale price)
        const priceSnapshot = product.price;

        if (existingCartItem) {
            // Update existing cart item quantity
            const newQuantity = existingCartItem.quantity + quantity;

            // Check if new quantity exceeds stock
            if (newQuantity > product.stock_quantity) {
                return NextResponse.json(
                    { success: false, error: `Cannot add more. Only ${product.stock_quantity} items available` },
                    { status: 400 }
                );
            }

            // Check maximum quantity limit
            if (newQuantity > 10) {
                return NextResponse.json(
                    { success: false, error: 'Maximum quantity per item is 10' },
                    { status: 400 }
                );
            }

            const { error: updateError } = await supabase
                .from('cart_items')
                .update({
                    quantity: newQuantity,
                    price: priceSnapshot,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingCartItem.id);

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
                data: { action: 'updated', newQuantity }
            });
        } else {
            // Add new item to cart
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    variant_id: variantId || null,
                    quantity: quantity,
                    price: priceSnapshot,
                });

            if (insertError) {
                console.error('Error adding to cart:', insertError);
                return NextResponse.json(
                    { success: false, error: 'Failed to add item to cart' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Item added to cart successfully',
                data: { action: 'added', quantity }
            });
        }
    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
