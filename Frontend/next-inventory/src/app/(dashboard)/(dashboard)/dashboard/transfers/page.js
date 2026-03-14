'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { transfersAPI, warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

const statusColors = { draft: 'bg-slate-100 text-slate-700', scheduled: 'bg-blue-100 text-blue-800', in_transit: 'bg-amber-100 text-amber-800', done: 'bg-emerald-100 text-emerald-800', canceled: 'bg-red-100 text-red-800' };

export default function Transfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');

  const fetchTransfers = () => { setLoading(true); transfersAPI.getAll({ page, limit: 10, status: status || undefined, source: source || undefined, destination: destination || undefined }).then((res) => { setTransfers(res.data.data); setTotal(res.data.total); }).catch(() => toast.error('Failed to load transfers')).finally(() => setLoading(false)); };
  useEffect(() => { warehousesAPI.getAll().then((res) => setWarehouses(res.data.data)); }, []);
  useEffect(() => { fetchTransfers(); }, [page, status, source, destination]);

  const handleComplete = (id) => { if (!window.confirm('Complete this transfer? Stock will move between locations.')) return; transfersAPI.complete(id).then(() => { toast.success('Transfer completed'); fetchTransfers(); }).catch((err) => toast.error(err.response?.data?.message || 'Failed')); };
  const handleDelete = (id) => { if (!window.confirm('Delete this transfer?')) return; transfersAPI.delete(id).then(() => { toast.success('Transfer deleted'); fetchTransfers(); }).catch((err) => toast.error(err.response?.data?.message || 'Delete failed')); };

  const columns = [
    { key: 'fromWarehouse', label: 'From', render: (loc) => loc?.name || '—' },
    { key: 'toWarehouse', label: 'To', render: (loc) => loc?.name || '—' },
    { key: 'items', label: 'Items', render: (items) => items?.length || 0 },
    { key: 'status', label: 'Status', render: (s) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[s] || 'bg-slate-100'}`}>{s}</span> },
    { key: 'createdAt', label: 'Date', render: (d) => d ? new Date(d).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/transfers/${row._id}/edit`} className="text-zoho-blue hover:text-zoho-dark-blue font-medium">Edit</Link>
          {row.status !== 'done' && row.status !== 'canceled' && <button type="button" onClick={() => handleComplete(row._id)} className="text-emerald-600 hover:text-emerald-700">Complete</button>}
          {row.status !== 'done' && <button type="button" onClick={() => handleDelete(row._id)} className="text-red-600 hover:text-red-700">Delete</button>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Internal Transfers</h1><p className="mt-1 text-slate-600">Move stock between warehouses</p></div>
        <Link href="/dashboard/transfers/new" className="inline-flex items-center rounded-lg bg-zoho-blue px-4 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue transition-colors shadow-sm">New Transfer</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All statuses</option><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="in_transit">In transit</option><option value="done">Done</option><option value="canceled">Canceled</option></select>
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">From (any)</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select>
        <select value={destination} onChange={(e) => { setDestination(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">To (any)</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select>
      </div>
      <DataTable columns={columns} data={transfers} loading={loading} emptyMessage="No transfers" />
      {total > 10 && <div className="flex items-center justify-between"><p className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 10)}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Previous</button><button type="button" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Next</button></div></div>}
    </div>
  );
}
