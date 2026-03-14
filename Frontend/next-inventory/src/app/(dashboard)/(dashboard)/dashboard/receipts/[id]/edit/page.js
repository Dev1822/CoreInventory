'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { receiptsAPI, productsAPI, warehousesAPI } from '../../../../../../services/api';

export default function ReceiptEdit({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ supplier: '', warehouse: '', items: [] });

  useEffect(() => {
    Promise.all([productsAPI.getAll({ limit: 500 }), warehousesAPI.getAll()]).then(([pRes, wRes]) => {
      setProducts(pRes.data.data);
      setWarehouses(wRes.data.data);
    });
    receiptsAPI.getOne(id).then((res) => {
      const r = res.data.data;
      setForm({
        supplier: r.supplier || '',
        warehouse: r.warehouse?._id || r.warehouse || '',
        items: (r.items || []).map((item) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity
        }))
      });
    }).catch(() => toast.error('Receipt not found'));
  }, [id]);

  const addLine = () => setForm((f) => ({ ...f, items: [...f.items, { product: '', quantity: 1 }] }));
  const updateLine = (index, field, value) => setForm((f) => ({ ...f, items: f.items.map((line, i) => i === index ? { ...line, [field]: value } : line) }));
  const removeLine = (index) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.supplier.trim()) { toast.error('Supplier is required'); return; }
    if (!form.warehouse) { toast.error('Warehouse is required'); return; }
    if (!form.items.length || form.items.some((l) => !l.product || !l.quantity)) { toast.error('Add at least one product with quantity'); return; }
    setLoading(true);
    receiptsAPI.update(id, {
      supplier: form.supplier,
      warehouse: form.warehouse,
      items: form.items.map((l) => ({ product: l.product, quantity: Number(l.quantity) }))
    }).then(() => { toast.success('Receipt updated'); router.push('/dashboard/receipts'); }).catch((err) => toast.error(err.response?.data?.message || 'Failed')).finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit Receipt</h1>
      <p className="mt-1 text-slate-600">Incoming stock from supplier</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-slate-700">Supplier *</label><input type="text" value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" required /></div>
          <div><label className="block text-sm font-medium text-slate-700">Warehouse *</label><select value={form.warehouse} onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" required><option value="">Select warehouse</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="block text-sm font-medium text-slate-700">Products</label><button type="button" onClick={addLine} className="text-sm text-zoho-blue hover:text-zoho-dark-blue">+ Add line</button></div>
          <div className="mt-2 space-y-2">
            {form.items.map((line, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-2">
                <select value={line.product} onChange={(e) => updateLine(index, 'product', e.target.value)} className="flex-1 min-w-[200px] rounded border border-slate-300 px-2 py-1.5 text-sm" required><option value="">Select product</option>{products.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}</select>
                <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} className="w-24 rounded border border-slate-300 px-2 py-1.5 text-sm" placeholder="Qty" />
                <button type="button" onClick={() => removeLine(index)} className="text-red-600 hover:text-red-700 text-sm font-medium ml-auto">Remove</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="rounded-lg bg-zoho-blue px-4 py-2 font-medium text-white hover:bg-zoho-dark-blue disabled:opacity-50">{loading ? 'Saving...' : 'Update'}</button>
          <button type="button" onClick={() => router.push('/dashboard/receipts')} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
