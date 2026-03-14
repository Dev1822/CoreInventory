'use client';
import { useAuth } from '../../../../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      <p className="mt-1 text-slate-600">Your account information</p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <dl className="space-y-4">
          <div><dt className="text-sm font-medium text-slate-500">Name</dt><dd className="mt-1 text-slate-900">{user?.name}</dd></div>
          <div><dt className="text-sm font-medium text-slate-500">Email</dt><dd className="mt-1 text-slate-900">{user?.email}</dd></div>
          <div><dt className="text-sm font-medium text-slate-500">Role</dt><dd className="mt-1 capitalize text-slate-900">{user?.role}</dd></div>
        </dl>
      </div>
    </div>
  );
}
