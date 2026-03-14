'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { productsAPI, warehousesAPI } from '../../../../../services/api';

export default function ProductNew() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'pcs', initialStock: 0, location: '', reorderThreshold: 0 });

  useEffect(() => {
    warehousesAPI.getAll().then((res) => setWarehouses(res.data.data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) { toast.error('Name and SKU are required'); return; }
    setLoading(true);
    const payload = { name: form.name, sku: form.sku, category: form.category, unit: form.unit, initialStock: Number(form.initialStock) || 0, reorderThreshold: Number(form.reorderThreshold) ?? 0 };
    if (form.location) payload.location = form.location;
    productsAPI.create(payload).then(() => { toast.success('Product created'); router.push('/dashboard/products'); }).catch((err) => toast.error(err.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">New Product</h1>
      <p className="mt-1 text-slate-600">Product details and initial stock</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div><label className="block text-sm font-medium text-slate-700">Product Name *</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" required /></div>
        <div><label className="block text-sm font-medium text-slate-700">SKU / Code *</label><input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" placeholder="e.g. SKU-001" required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-slate-700">Category</label><input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Unit of Measure</label><input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" placeholder="pcs, box, kg..." /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-slate-700">Initial Stock (optional)</label><input type="number" min={0} value={form.initialStock} onChange={(e) => setForm((f) => ({ ...f, initialStock: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
          <div className="md:col-span-1"><label className="block text-sm font-medium text-slate-700">Location (Warehouse)</label><select value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">— Select —</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700">Reorder Threshold (low stock alert)</label><input type="number" min={0} value={form.reorderThreshold} onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="rounded-lg bg-zoho-blue px-4 py-2 font-medium text-white hover:bg-zoho-dark-blue disabled:opacity-50">{loading ? 'Saving...' : 'Create'}</button>
          <button type="button" onClick={() => router.push('/dashboard/products')} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
