'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Types for user profile
interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  wallet_balance: number;
  reward_points: number;
  is_verified: boolean;
}

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  address_type: 'home' | 'office' | 'other';
  is_default: boolean;
}

// Account menu items
const accountMenuItems = [
  {
    id: 'orders',
    label: 'My Orders',
    description: 'View, track and manage your orders',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    href: '/orders',
  },
  {
    id: 'wishlist',
    label: 'My Wishlist',
    description: 'Your saved products',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    href: '/wishlist',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    description: 'Manage your wallet balance',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    href: '/wallet',
  },
  {
    id: 'addresses',
    label: 'Saved Addresses',
    description: 'Manage your delivery addresses',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    href: '/profile/addresses',
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'Get help with your orders',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    href: '/help',
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });

  // Fetch user profile and addresses from Supabase
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          // Redirect to signin if not authenticated
          router.push('/signin');
          return;
        }

        // Fetch user profile from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user profile:', userError);
          // If user doesn't exist in users table, create with auth data
          if (userError.code === 'PGRST116') {
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              phone: session.user.phone || null,
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              date_of_birth: null,
              gender: null,
              wallet_balance: 0,
              reward_points: 0,
              is_verified: false,
            });
          }
        } else {
          setProfile(userData);
        }

        // Fetch user addresses
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('is_default', { ascending: false });

        if (!addressError && addressData) {
          setAddresses(addressData);
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [supabase, router]);

  // Update edit form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
      });
    }
  }, [profile]);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          gender: editForm.gender || null,
          date_of_birth: editForm.date_of_birth || null,
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      } else {
        setProfile({
          ...profile,
          full_name: editForm.full_name,
          phone: editForm.phone,
          gender: editForm.gender,
          date_of_birth: editForm.date_of_birth,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Format gender for display
  const formatGender = (gender: string | null) => {
    if (!gender) return 'Not set';
    return gender.charAt(0).toUpperCase() + gender.slice(1).replace(/_/g, ' ');
  };

  // Get default address
  const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#e4007c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please sign in to view your profile</p>
          <Link href="/signin" className="text-[#e4007c] font-medium hover:underline">
            Sign In
          </Link>
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
            <span className="text-[#2c2c2c] font-medium">My Account</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-[#fadaed] to-[#f8c5d8] p-8 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-white p-1 shadow-lg">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        width={88}
                        height={88}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#fadaed] flex items-center justify-center">
                        <span className="text-3xl font-bold text-[#c57baa]">
                          {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#e4007c] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#c9006d] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.full_name || 'User'}</h2>
                <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
                
                {/* Wallet & Rewards */}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#c57baa]">???{profile.wallet_balance?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500">Wallet</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#c57baa]">{profile.reward_points || 0}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-[#e4007c] text-sm font-medium hover:underline"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{profile.full_name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Email Address</label>
                    <p className="text-gray-900 mt-1">{profile.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        placeholder="+91 98765 43210"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{profile.phone || 'Not set'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Gender</label>
                      {isEditing ? (
                        <select
                          value={editForm.gender}
                          onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        >
                          <option value="">Select</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 mt-1">{formatGender(profile.gender)}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Birthday</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.date_of_birth}
                          onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{formatDate(profile.date_of_birth)}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full mt-4 bg-[#e4007c] text-white py-3 rounded-lg font-medium hover:bg-[#c9006d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>

              {/* Default Address */}
              {defaultAddress && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Default Address</h4>
                      <Link href="/profile/addresses" className="text-[#e4007c] text-xs hover:underline">
                        Manage
                      </Link>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="font-medium text-gray-800">{defaultAddress.full_name}</p>
                      <p className="text-gray-600 mt-1">
                        {defaultAddress.address_line1}
                        {defaultAddress.address_line2 && `, ${defaultAddress.address_line2}`}
                      </p>
                      <p className="text-gray-600">
                        {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                      </p>
                      <p className="text-gray-500 mt-1">Phone: {defaultAddress.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <div className="px-6 pb-6">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-[#e64131] py-3 border border-[#e64131] rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Menu Items */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Account</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accountMenuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-pink-200 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[rgba(250,218,221,0.3)] flex items-center justify-center text-[#c57baa] group-hover:bg-[rgba(250,218,221,0.5)] transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-[#e4007c] transition-colors">
                          {item.label}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#e4007c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {/* All Saved Addresses */}
            {addresses.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                  <Link href="/profile/addresses" className="text-[#e4007c] text-sm font-medium hover:underline">
                    Manage All
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.slice(0, 2).map((address) => (
                    <div
                      key={address.id}
                      className="bg-white rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          address.address_type === 'home' 
                            ? 'bg-blue-100 text-blue-700' 
                            : address.address_type === 'office'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
                        </span>
                        {address.is_default && (
                          <span className="text-xs font-medium text-green-600">Default</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800">{address.full_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">???? {address.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Address CTA if no addresses */}
            {addresses.length === 0 && (
              <div className="mt-8 bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-500 mb-4">Add an address for faster checkout</p>
                <Link
                  href="/profile/addresses/new"
                  className="inline-block bg-[#e4007c] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#c9006d] transition-colors"
                >
                  Add Address
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
