'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = () => { setLoading(true); warehousesAPI.getAll().then((res) => setWarehouses(res.data.data)).catch(() => toast.error('Failed to load warehouses')).finally(() => setLoading(false)); };
  useEffect(() => { fetchWarehouses(); }, []);

  const handleDelete = (id, name) => { if (!window.confirm(`Delete warehouse "${name}"?`)) return; warehousesAPI.delete(id).then(() => { toast.success('Warehouse deleted'); fetchWarehouses(); }).catch((err) => toast.error(err.response?.data?.message || 'Delete failed')); };

  const columns = [
    { key: 'code', label: 'Code', render: (c) => <span className="font-mono font-medium text-slate-900">{c}</span> },
    { key: 'name', label: 'Name' },
    { key: 'location', label: 'Location' },
    { key: 'capacity', label: 'Capacity', render: (c) => c != null ? c : '—' },
    { key: 'actions', label: 'Actions', render: (_, row) => (<div className="flex gap-2"><Link href={`/dashboard/warehouses/${row._id}/edit`} className="text-zoho-blue hover:text-zoho-dark-blue font-medium">Edit</Link><button type="button" onClick={() => handleDelete(row._id, row.name)} className="text-red-600 hover:text-red-700">Delete</button></div>) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Warehouses</h1><p className="mt-1 text-slate-600">Manage locations and capacity</p></div>
        <Link href="/dashboard/warehouses/new" className="inline-flex items-center rounded-lg bg-zoho-blue px-4 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue transition-colors shadow-sm">Add Warehouse</Link>
      </div>
      <DataTable columns={columns} data={warehouses} loading={loading} emptyMessage="No warehouses" />
    </div>
  );
}
