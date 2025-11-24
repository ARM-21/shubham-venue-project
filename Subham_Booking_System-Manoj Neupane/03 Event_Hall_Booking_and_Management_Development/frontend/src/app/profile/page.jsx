"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth');
    }
  }, [loading, user, router]);

  if (loading) return <div className="min-h-[200px] flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-6">
        {user?.avatar ? (
          <Image src={user.avatar} alt={user.name || 'avatar'} width={96} height={96} className="rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-maroon-primary text-white flex items-center justify-center text-2xl font-semibold">
            {user?.name ? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U'}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">Role: {user?.role || 'user'}</p>

          <div className="mt-4">
            <button
              onClick={async () => { try { await logout(); } catch(e){console.error(e);} router.push('/'); }}
              className="px-4 py-2 bg-maroon-primary text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
