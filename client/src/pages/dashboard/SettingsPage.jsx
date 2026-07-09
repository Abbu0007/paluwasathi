import { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();

  const fields = [
    { label: 'Full Name', value: user?.name, Icon: User },
    { label: 'Email', value: user?.email, Icon: Mail },
    { label: 'Phone', value: user?.phone, Icon: Phone },
    { label: 'District', value: user?.district, Icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />

      <main className="lg:ml-[260px] pt-[64px] lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black text-ink mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your account details and preferences.
          </p>

          {/* Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-ink mb-4">Profile</h2>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="w-16 h-16 rounded-full bg-primary text-white text-xl font-black flex items-center justify-center">
                {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <div>
                <p className="font-bold text-ink">{user?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              {fields.map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <Icon size={18} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                    <p className="text-sm text-ink truncate">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Profile editing will be available soon.
            </p>
          </div>

          {/* Account status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-ink mb-4">Account Status</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50">
              <Shield size={18} className="text-primary shrink-0" />
              <div>
                <p className="text-sm font-bold text-primary-dark">
                  {user?.isVerified ? 'Verified account' : 'Unverified'}
                </p>
                <p className="text-xs text-primary-dark/70">
                  {user?.isVerified
                    ? 'Your phone number has been verified.'
                    : 'Please verify your phone number.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}