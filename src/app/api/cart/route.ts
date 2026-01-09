import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/cart - Get user's cart with full details
export async function GET() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in to view your cart' },
                { status: 401 }
            );
        }

        // Fetch cart items with product details
        const { data: cartItems, error: cartError } = await supabase
            .from('cart_items')
            .select(`
        id,
        quantity,
        price,
        variant_id,
        added_at,
        updated_at,
        product:products (
          id,
          name,
          slug,
          price,
          original_price,
          is_active,
          stock_quantity,
          images
        )
      `)
            .eq('user_id', user.id)
            .order('added_at', { ascending: false });

        if (cartError) {
            console.error('Error fetching cart:', cartError);
            return NextResponse.json(
                { success: false, error: 'Failed to load cart' },
                { status: 500 }
            );
        }

        // Calculate cart totals
        let subtotal = 0;
        let totalItems = 0;
        let totalSavings = 0;

        const formattedItems = cartItems?.map((item) => {
            const product = (Array.isArray(item.product) ? item.product[0] : item.product) as {
                id: string;
                name: string;
                slug: string;
                price: number;
                original_price: number | null;
                is_active: boolean;
                stock_quantity: number;
                images: string[];
            };

            const currentPrice = product.price;
            const itemTotal = currentPrice * item.quantity;
            const originalTotal = (product.original_price || product.price) * item.quantity;
            const savings = originalTotal - itemTotal;

            subtotal += itemTotal;
            totalItems += item.quantity;
            totalSavings += savings;

            return {
                id: item.id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                image: product.images?.[0] || '/images/placeholder.png',
                quantity: item.quantity,
                price: currentPrice,
                originalPrice: product.original_price || product.price,
                priceSnapshot: item.price,
                variantId: item.variant_id,
                isActive: product.is_active,
                stockAvailable: product.stock_quantity,
                isOutOfStock: product.stock_quantity < item.quantity,
                itemTotal,
            };
        }) || [];

        // Calculate shipping (free above ₹299)
        const shippingThreshold = 299;
        const shippingCost = subtotal >= shippingThreshold ? 0 : 49;
        const amountForFreeShipping = Math.max(0, shippingThreshold - subtotal);

        // Calculate reward points (1 point per ₹100)
        const rewardPoints = Math.floor(subtotal / 100);

        // Grand total
        const grandTotal = subtotal + shippingCost;

        return NextResponse.json({
            success: true,
            data: {
                items: formattedItems,
                summary: {
                    subtotal,
                    shippingCost,
                    totalSavings,
                    grandTotal,
                    totalItems,
                    rewardPoints,
                    amountForFreeShipping,
                    freeShippingThreshold: shippingThreshold,
                },
                appliedCoupon: null, // TODO: Add coupon support
            }
        });
    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Please sign in' },
                { status: 401 }
            );
        }

        // Delete all cart items for user
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error clearing cart:', deleteError);
            return NextResponse.json(
                { success: false, error: 'Failed to clear cart' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Cart API error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
