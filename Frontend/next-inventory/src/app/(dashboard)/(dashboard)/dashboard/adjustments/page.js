'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adjustmentsAPI, productsAPI, warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ warehouse: '', items: [], reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAdjustments = () => {
    setLoading(true);
    adjustmentsAPI.getAll({ page, limit: 10 })
      .then((res) => {
        setAdjustments(res.data.data);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('Failed to load adjustments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdjustments(); }, [page]);
  useEffect(() => {
    Promise.all([productsAPI.getAll({ limit: 500 }), warehousesAPI.getAll()])
      .then(([pRes, wRes]) => {
        setProducts(pRes.data.data);
        setWarehouses(wRes.data.data);
      });
  }, []);

  useEffect(() => {
    if (form.warehouse) {
      warehousesAPI.getOne(form.warehouse + '/stock')
        .then(res => setWarehouseStock(res.data.data))
        .catch(() => setWarehouseStock([]));
    } else {
      setWarehouseStock([]);
    }
  }, [form.warehouse]);

  const addLine = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { product: '', systemQty: 0, countedQty: 0 }]
    }));
  };

  const updateLine = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;

    if (field === 'product') {
      const stockInfo = warehouseStock.find(s => (s.product?._id || s.product) === value);
      newItems[index].systemQty = stockInfo ? stockInfo.quantity : 0;
      newItems[index].countedQty = newItems[index].systemQty;
    }

    setForm(f => ({ ...f, items: newItems }));
  };

  const removeLine = (index) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.warehouse) { toast.error('Warehouse is required'); return; }
    if (form.items.length === 0) { toast.error('Add at least one item'); return; }
    if (form.items.some(i => !i.product)) { toast.error('All items must have a product'); return; }

    setSubmitting(true);
    adjustmentsAPI.create(form)
      .then(() => {
        toast.success('Adjustment recorded as draft');
        setShowForm(false);
        setForm({ warehouse: '', items: [], reason: '' });
        fetchAdjustments();
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'))
      .finally(() => setSubmitting(false));
  };

  const handleValidate = (id) => {
    adjustmentsAPI.validate(id)
      .then(() => {
        toast.success('Adjustment applied to stock');
        fetchAdjustments();
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
  };

  const columns = [
    { key: 'refNumber', label: 'Reference' },
    { key: 'warehouse', label: 'Location', render: (w) => w?.name || '—' },
    { key: 'items', label: 'Items', render: (items) => items?.length || 0 },
    { key: 'status', label: 'Status', render: (s) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${s === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{s}</span> },
    { key: 'reason', label: 'Reason' },
    { key: 'createdAt', label: 'Date', render: (d) => d ? new Date(d).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'draft' && (
            <button
              onClick={() => handleValidate(row._id)}
              className="text-xs font-medium text-zoho-blue hover:underline"
            >
              Validate
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1><p className="mt-1 text-slate-600">Reconcile physical count with system stock</p></div>
        {!showForm && <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center rounded-lg bg-zoho-blue px-4 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue">New Adjustment</button>}
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Record adjustment</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Warehouse *</label>
                <select
                  value={form.warehouse}
                  onChange={(e) => setForm(f => ({ ...f, warehouse: e.target.value, items: [] }))}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none"
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Annual physical count"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-zoho-blue focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Items</h3>
                <button type="button" onClick={addLine} disabled={!form.warehouse} className="text-sm font-medium text-zoho-blue hover:text-zoho-dark-blue disabled:opacity-50">+ Add Item</button>
              </div>

              <div className="rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Product</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">System Qty</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Counted Qty</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Diff</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {form.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2">
                          <select
                            value={item.product}
                            onChange={(e) => updateLine(i, 'product', e.target.value)}
                            className="w-full rounded border-slate-300 p-1 focus:border-zoho-blue focus:outline-none"
                          >
                            <option value="">Select product</option>
                            {products?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="p-2 text-center text-slate-500">{item.systemQty}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.countedQty}
                            onChange={(e) => updateLine(i, 'countedQty', Number(e.target.value))}
                            className="w-full rounded border-slate-300 p-1 focus:border-zoho-blue focus:outline-none"
                          />
                        </td>
                        <td className={`p-2 font-medium ${item.countedQty - item.systemQty >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.countedQty - item.systemQty > 0 ? '+' : ''}{item.countedQty - item.systemQty}
                        </td>
                        <td className="p-2">
                          <button type="button" onClick={() => removeLine(i)} className="text-slate-400 hover:text-red-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </td>
                      </tr>
                    ))}
                    {form.items.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-slate-400 italic">No items added. Click "+ Add Item" to begin.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-lg bg-zoho-blue px-6 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue disabled:opacity-50">{submitting ? 'Saving...' : 'Save Adjustment'}</button>
            </div>
          </form>
        </div>
      )}

      <DataTable columns={columns} data={adjustments} loading={loading} emptyMessage="No adjustments found" />
      {total > 10 && <div className="flex items-center justify-between"><p className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 10)}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Previous</button><button type="button" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Next</button></div></div>}
    </div>
  );
}
