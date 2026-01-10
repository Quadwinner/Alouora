import { NextResponse } from 'next/server';

// Mock product data for display
const mockProduct = {
  id: '302adad7-c0ee-4a44-b866-c16f83d7acb0',
  name: 'Ruby Woo Lipstick',
  description: 'The iconic matte red lipstick that made MAC famous. This long-wearing formula features an intense colour payoff and a completely matte finish.',
  price: 23,
  original_price: 23,
  sale_price: 23,
  discount: '0% Off',
  discount_percentage: 0,
  rating_average: 4.9,
  rating_count: 98765,
  stock_quantity: 50,
  is_active: true,
  is_new: true,
  category: {
    id: 'cat-1',
    name: 'Lipstick',
    slug: 'lipstick'
  },
  brand: {
    id: 'brand-1',
    name: 'MAC',
    slug: 'mac'
  },
  images: [
    '/images/makeup/lipsticks/products/product-1.png',
    '/images/makeup/lipsticks/products/product-2.png',
    '/images/makeup/lipsticks/products/product-3.png'
  ],
  thumbnail: '/images/makeup/lipsticks/products/product-1.png',
  ingredients: [
    'Dimethicone', 'Isoeicosane', 'Kaolin', 'Ceresin', 'Paraffin', 'Isononyl Isononanoate', 'Microcrystalline Wax'
  ],
  how_to_use: [
    'Apply to lips directly from the lipstick bullet or use a 316 Brush for more precision.'
  ],
  related_products: [
    {
      id: 'rel-1',
      name: 'Super Stay Vinyl Ink Liquid Lipstick',
      price: 17,
      original_price: 34,
      discount_percentage: 50,
      rating_average: 4.8,
      rating_count: 1200,
      thumbnail: '/images/makeup/lipsticks/products/product-1.png'
    },
    {
      id: 'rel-2',
      name: 'Powder Kiss Lipstick',
      price: 24,
      original_price: 24,
      discount_percentage: 0,
      rating_average: 4.7,
      rating_count: 850,
      thumbnail: '/images/makeup/lipsticks/products/product-1.png'
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Return mock data for now to visualize the frontend design
  return NextResponse.json({
    success: true,
    data: mockProduct
  });
}
