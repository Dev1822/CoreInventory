'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { receiptsAPI, warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

const statusColors = { draft: 'bg-slate-100 text-slate-700', waiting: 'bg-amber-100 text-amber-800', ready: 'bg-blue-100 text-blue-800', done: 'bg-emerald-100 text-emerald-800', canceled: 'bg-red-100 text-red-800' };

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const fetchReceipts = () => {
    setLoading(true);
    receiptsAPI.getAll({ page, limit: 10, status: status || undefined, warehouse: warehouse || undefined }).then((res) => { setReceipts(res.data.data); setTotal(res.data.total); }).catch(() => toast.error('Failed to load receipts')).finally(() => setLoading(false));
  };

  useEffect(() => { warehousesAPI.getAll().then((res) => setWarehouses(res.data.data)); }, []);
  useEffect(() => { fetchReceipts(); }, [page, status, warehouse]);

  const handleValidate = (id) => { if (!window.confirm('Validate this receipt? Stock will be updated.')) return; receiptsAPI.validate(id).then(() => { toast.success('Receipt validated'); fetchReceipts(); }).catch((err) => toast.error(err.response?.data?.message || 'Validation failed')); };
  const handleDelete = (id) => { if (!window.confirm('Delete this receipt?')) return; receiptsAPI.delete(id).then(() => { toast.success('Receipt deleted'); fetchReceipts(); }).catch((err) => toast.error(err.response?.data?.message || 'Delete failed')); };

  const columns = [
    { key: 'warehouse', label: 'Warehouse', render: (w) => w?.name || '—' },
    { key: 'items', label: 'Items', render: (items) => items?.length || 0 },
    { key: 'status', label: 'Status', render: (s) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s] || 'bg-slate-100'}`}>{s}</span> },
    { key: 'createdAt', label: 'Date', render: (d) => d ? new Date(d).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/receipts/${row._id}/edit`} className="text-zoho-blue hover:text-zoho-dark-blue font-medium">Edit</Link>
          {row.status !== 'done' && row.status !== 'canceled' && <button type="button" onClick={() => handleValidate(row._id)} className="text-emerald-600 hover:text-emerald-700">Validate</button>}
          {row.status !== 'done' && <button type="button" onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-700">Delete</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Receipts</h1><p className="mt-1 text-slate-600">Incoming stock from suppliers</p></div>
        <Link href="/dashboard/receipts/new" className="inline-flex items-center rounded-lg bg-zoho-blue px-4 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue transition-colors shadow-sm">New Receipt</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All statuses</option><option value="draft">Draft</option><option value="waiting">Waiting</option><option value="ready">Ready</option><option value="done">Done</option><option value="canceled">Canceled</option></select>
        <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All warehouses</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select>
      </div>
      <DataTable columns={columns} data={receipts} loading={loading} emptyMessage="No receipts" />
      {total > 10 && <div className="flex items-center justify-between"><p className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 10)}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Previous</button><button type="button" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Next</button></div></div>}
    </div>
  );
}
