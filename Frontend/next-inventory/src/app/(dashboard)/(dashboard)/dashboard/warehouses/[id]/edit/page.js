'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { warehousesAPI } from '../../../../../../services/api';

export default function WarehouseEdit({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', location: '', capacity: '' });

  useEffect(() => {
    warehousesAPI.getOne(id).then((res) => {
      const w = res.data.data;
      setForm({
        name: w.name || '',
        code: w.code || '',
        location: w.location || '',
        capacity: w.capacity != null ? w.capacity : ''
      });
    }).catch(() => toast.error('Warehouse not found'));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    setLoading(true);
    warehousesAPI.update(id, {
      name: form.name,
      code: form.code.toUpperCase(),
      location: form.location,
      capacity: form.capacity === '' ? undefined : Number(form.capacity)
    }).then(() => { toast.success('Warehouse updated'); router.push('/dashboard/warehouses'); }).catch((err) => toast.error(err.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit Warehouse</h1><p className="mt-1 text-slate-600">Warehouse details</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-slate-700">Code *</label><input type="text" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" placeholder="e.g. WH-001" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">Name *</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700">Location</label><input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" placeholder="Building, floor, zone..." /></div>
        <div><label className="block text-sm font-medium text-slate-700">Capacity (optional)</label><input type="number" min={0} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
        <div className="flex gap-3 pt-4"><button type="submit" disabled={loading} className="rounded-lg bg-zoho-blue px-4 py-2 font-medium text-white hover:bg-zoho-dark-blue disabled:opacity-50">{loading ? 'Saving...' : 'Update'}</button><button type="button" onClick={() => router.push('/dashboard/warehouses')} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button></div>
      </form>
    </div>
  );
}
