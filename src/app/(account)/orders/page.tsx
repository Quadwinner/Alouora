'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Types
interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  product_variant: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  payment_status: string;
  total_amount: number;
  expected_delivery_date: string | null;
  delivered_at: string | null;
  created_at: string;
  order_items: OrderItem[];
}

interface UserProfile {
  full_name: string | null;
  email: string;
}

// Sidebar navigation items
const sidebarNav = [
  { id: 'all', label: 'All Orders', icon: '/images/account/icon-all-orders.svg' },
  { id: 'on-the-way', label: 'On the way', icon: '/images/account/icon-on-the-way.svg', statuses: ['shipped', 'out_for_delivery'] },
  { id: 'delivered', label: 'Delivered', icon: '/images/account/icon-delivered.svg', statuses: ['delivered'] },
  { id: 'cancelled', label: 'Cancelled', icon: '/images/account/icon-cancelled.svg', statuses: ['cancelled'] },
  { id: 'returned', label: 'Returned', icon: '/images/account/icon-returned.svg', statuses: ['returned'] },
];

// Status display mapping
const statusDisplay: Record<string, { text: string; color: string }> = {
  pending: { text: 'Order Placed', color: 'text-yellow-600' },
  confirmed: { text: 'Confirmed', color: 'text-blue-600' },
  processing: { text: 'Processing', color: 'text-blue-600' },
  shipped: { text: 'Shipped', color: 'text-[#c57baa]' },
  out_for_delivery: { text: 'Out for Delivery', color: 'text-[#c57baa]' },
  delivered: { text: 'Delivered', color: 'text-green-600' },
  cancelled: { text: 'Cancelled', color: 'text-red-600' },
  returned: { text: 'Returned', color: 'text-gray-600' },
};

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');

  // Fetch user profile and orders from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          router.push('/signin');
          return;
        }

        // Fetch user profile
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setProfile(userData);
        } else {
          setProfile({
            full_name: session.user.user_metadata?.full_name || null,
            email: session.user.email || '',
          });
        }

        // Calculate date filter
        let dateFrom = new Date();
        switch (dateFilter) {
          case 'Last 30 Days':
            dateFrom.setDate(dateFrom.getDate() - 30);
            break;
          case 'Last 3 Months':
            dateFrom.setMonth(dateFrom.getMonth() - 3);
            break;
          case 'Last 6 Months':
            dateFrom.setMonth(dateFrom.getMonth() - 6);
            break;
          case 'Last Year':
            dateFrom.setFullYear(dateFrom.getFullYear() - 1);
            break;
          default:
            dateFrom = new Date(0); // All orders
        }

        // Fetch orders with items
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .eq('user_id', session.user.id)
          .gte('created_at', dateFrom.toISOString())
          .order('created_at', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else {
          setOrders(ordersData || []);
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, router, dateFilter]);

  // Filter orders based on active filter
  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    const navItem = sidebarNav.find(item => item.id === activeFilter);
    if (navItem?.statuses) {
      return navItem.statuses.includes(order.status);
    }
    return true;
  });

  // Count orders by status
  const getOrderCount = (filterId: string) => {
    if (filterId === 'all') return orders.length;
    const navItem = sidebarNav.find(item => item.id === filterId);
    if (navItem?.statuses) {
      return orders.filter(o => navItem.statuses!.includes(o.status)).length;
    }
    return 0;
  };

  // Format date for display
  const formatDate = (dateStr: string | null, isExpected = false) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const formatted = date.toLocaleDateString('en-IN', options);
    return isExpected ? `Expected by ${formatted}` : `On ${formatted}`;
  };

  // Get status info for display
  const getStatusInfo = (order: Order) => {
    const status = statusDisplay[order.status] || { text: order.status, color: 'text-gray-600' };
    let dateText = '';

    if (order.status === 'delivered' && order.delivered_at) {
      dateText = formatDate(order.delivered_at);
    } else if (['shipped', 'out_for_delivery', 'processing', 'confirmed'].includes(order.status) && order.expected_delivery_date) {
      dateText = formatDate(order.expected_delivery_date, true);
    } else {
      dateText = formatDate(order.created_at);
    }

    return { ...status, dateText };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e4007c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/profile" className="text-gray-500 hover:text-gray-700">Account</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[#2c2c2c] font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="flex max-w-[1920px] mx-auto">
        {/* Sidebar */}
        <aside className="w-[320px] lg:w-[400px] bg-white border-r border-gray-200 min-h-[calc(100vh-129px)] hidden md:block">
          <div className="p-6 lg:p-8">
            {/* User Profile Card */}
            <div className="bg-[rgba(250,218,221,0.1)] border border-[rgba(250,218,221,0.2)] rounded-xl p-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#fadaed] to-[#c57baa] p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[#fadaed] flex items-center justify-center">
                    <span className="text-lg font-bold text-[#c57baa]">
                      {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[#2c2c2c] font-medium">
                    Hello, {profile?.full_name?.split(' ')[0] || 'User'}
                  </p>
                  <p className="text-gray-500 text-sm">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Order History Navigation */}
            <div>
              <p className="text-gray-400 text-sm tracking-wide mb-4 px-2">Order History</p>
              <nav className="space-y-1">
                {sidebarNav.map((item) => {
                  const count = getOrderCount(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveFilter(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        activeFilter === item.id
                          ? 'bg-[rgba(250,218,221,0.2)]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={20}
                          height={20}
                          className="opacity-70"
                        />
                        <span className={`${
                          activeFilter === item.id
                            ? 'text-[#e4007c] font-medium'
                            : 'text-gray-600'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {count > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          activeFilter === item.id
                            ? 'bg-white text-[#e4007c] shadow-sm'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl font-medium text-[#2c2c2c]">My Orders</h1>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm font-medium">Filter by:</span>
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-[#2c2c2c] shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
                >
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>All Orders</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filter Tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {sidebarNav.map((item) => {
              const count = getOrderCount(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === item.id
                      ? 'bg-[#e4007c] text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {item.label}
                  {count > 0 && ` (${count})`}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order);
                const firstItem = order.order_items?.[0];

                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="block bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      {/* Order Status */}
                      <div className="mb-4">
                        <p className={`text-[17px] font-medium tracking-tight ${statusInfo.color}`}>
                          {statusInfo.text}
                        </p>
                        <p className="text-gray-500 text-sm">{statusInfo.dateText}</p>
                      </div>

                      {/* Product Info */}
                      {firstItem && (
                        <div className="bg-white border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {firstItem.product_image ? (
                                <Image
                                  src={firstItem.product_image}
                                  alt={firstItem.product_name}
                                  width={54}
                                  height={54}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[15px] font-medium text-gray-800 truncate">
                                {firstItem.product_name}
                              </p>
                              <p className="text-[13px] text-gray-500 mt-1">
                                {firstItem.product_variant || `Qty: ${firstItem.quantity}`}
                              </p>
                              {order.order_items.length > 1 && (
                                <p className="text-[12px] text-[#c57baa] mt-1">
                                  +{order.order_items.length - 1} more item(s)
                                </p>
                              )}
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order meta */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>Order #{order.order_number}</span>
                        <span>???{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeFilter === 'all' ? 'No orders yet' : `No ${sidebarNav.find(n => n.id === activeFilter)?.label.toLowerCase()} orders`}
              </h3>
              <p className="text-gray-500 mb-6">
                {activeFilter === 'all'
                  ? "Looks like you haven't placed any orders yet."
                  : 'Try changing the filter to see more orders.'}
              </p>
              <Link
                href="/"
                className="inline-block bg-[#e4007c] text-white px-8 py-3 rounded-full font-medium hover:bg-[#c9006d] transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
