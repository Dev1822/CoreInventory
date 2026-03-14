'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { productsAPI, warehousesAPI } from '../../../../../../services/api';

export default function ProductEdit({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: '', unit: 'pcs', initialStock: 0, location: '', reorderThreshold: 0 });

  useEffect(() => {
    warehousesAPI.getAll().then((res) => setWarehouses(res.data.data));
    productsAPI.getOne(id).then((res) => {
      const p = res.data.data;
      setForm({ name: p.name, sku: p.sku, category: p.category || '', unit: p.unit || 'pcs', initialStock: p.initialStock ?? 0, location: p.stockByLocation?.[0]?.warehouse?._id || p.stockByLocation?.[0]?.warehouse || '', reorderThreshold: p.reorderThreshold ?? 0 });
    }).catch(() => toast.error('Product not found'));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) { toast.error('Name and SKU are required'); return; }
    setLoading(true);
    const payload = { name: form.name, sku: form.sku, category: form.category, unit: form.unit, initialStock: Number(form.initialStock) || 0, reorderThreshold: Number(form.reorderThreshold) ?? 0 };
    if (form.location) payload.location = form.location;
    productsAPI.update(id, payload).then(() => { toast.success('Product updated'); router.push('/dashboard/products'); }).catch((err) => toast.error(err.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
      <p className="mt-1 text-slate-600">Product details and initial stock</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div><label className="block text-sm font-medium text-slate-700">Product Name *</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" required /></div>
        <div><label className="block text-sm font-medium text-slate-700">SKU / Code *</label><input type="text" value={form.sku} disabled className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue disabled:opacity-50" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-slate-700">Category</label><input type="text" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
          <div><label className="block text-sm font-medium text-slate-700">Unit of Measure</label><input type="text" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" placeholder="pcs, box, kg..." /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700">Reorder Threshold (low stock alert)</label><input type="number" min={0} value={form.reorderThreshold} onChange={(e) => setForm((f) => ({ ...f, reorderThreshold: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" /></div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="rounded-lg bg-zoho-blue px-4 py-2 font-medium text-white hover:bg-zoho-dark-blue disabled:opacity-50">{loading ? 'Saving...' : 'Update'}</button>
          <button type="button" onClick={() => router.push('/dashboard/products')} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
