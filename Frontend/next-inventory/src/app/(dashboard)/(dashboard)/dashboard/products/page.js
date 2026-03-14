'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { productsAPI, warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    productsAPI
      .getAll({ page, limit: 10, search: search || undefined, category: category || undefined, warehouse: warehouse || undefined })
      .then((res) => { setProducts(res.data.data); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { warehousesAPI.getAll().then((res) => setWarehouses(res.data.data)); }, []);
  useEffect(() => { fetchProducts(); }, [page, search, category, warehouse]);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    productsAPI.delete(id).then(() => { toast.success('Product deleted'); fetchProducts(); }).catch((err) => toast.error(err.response?.data?.message || 'Delete failed'));
  };

  const totalStock = (p) => {
    if (p.stockByLocation?.length) return p.stockByLocation.reduce((s, l) => s + (l.quantity || 0), 0);
    return p.initialStock ?? 0;
  };

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    { key: 'totalStock', label: 'Stock', render: (_, row) => totalStock(row) },
    {
      key: 'actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/products/${row._id}/edit`} className="text-zoho-blue hover:text-zoho-dark-blue font-medium">Edit</Link>
          <button type="button" onClick={() => handleDelete(row._id, row.name)} className="text-red-600 hover:text-red-700">Delete</button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900">Products</h1><p className="mt-1 text-slate-600">Manage your product catalog and stock</p></div>
        <Link href="/dashboard/products/new" className="inline-flex items-center rounded-lg bg-zoho-blue px-4 py-2 text-sm font-medium text-white hover:bg-zoho-dark-blue transition-colors shadow-sm">
          Add Product
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <input type="search" placeholder="Search by name or SKU..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue" />
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Category filter</button>
        <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue">
          <option value="">All warehouses</option>
          {warehouses?.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} data={products} loading={loading} emptyMessage="No products found" />
      {total > 10 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 10)}</p>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Previous</button>
            <button type="button" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
