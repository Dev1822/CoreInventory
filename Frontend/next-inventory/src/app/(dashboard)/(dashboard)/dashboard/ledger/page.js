'use client';
import { useState, useEffect } from 'react';
import { ledgerAPI, productsAPI, warehousesAPI } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';

const operationColors = { receipt: 'bg-emerald-100 text-emerald-800', delivery: 'bg-red-100 text-red-800', transfer_in: 'bg-blue-100 text-blue-800', transfer_out: 'bg-indigo-100 text-indigo-800', adjustment: 'bg-amber-100 text-amber-800' };

export default function StockLedger() {
  const [ledger, setLedger] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [product, setProduct] = useState('');
  const [operationType, setOperationType] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const fetchLedger = () => { setLoading(true); ledgerAPI.getAll({ page, limit: 20, product: product || undefined, operationType: operationType || undefined, warehouse: warehouse || undefined }).then((res) => { setLedger(res.data.data); setTotal(res.data.total); }).catch(() => { }).finally(() => setLoading(false)); };
  useEffect(() => { Promise.all([productsAPI.getAll({ limit: 500 }), warehousesAPI.getAll()]).then(([pRes, wRes]) => { setProducts(pRes.data.data); setWarehouses(wRes.data.data); }); }, []);
  useEffect(() => { fetchLedger(); }, [page, product, operationType, warehouse]);

  const columns = [
    { key: 'product', label: 'Product', render: (p) => p?.name || '—' },
    { key: 'type', label: 'Type', render: (t) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${operationColors[t] || 'bg-slate-100'}`}>{t}</span> },
    { key: 'qty', label: 'Qty Change', render: (q) => <span className={q >= 0 ? 'text-emerald-600' : 'text-red-600'}>{q >= 0 ? '+' : ''}{q}</span> },
    { key: 'warehouse', label: 'Location', render: (w) => w?.name || '—' },
    { key: 'date', label: 'Date', render: (d) => d ? new Date(d).toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Stock Ledger</h1><p className="mt-1 text-slate-600">Complete history of stock movements</p></div>
      <div className="flex flex-wrap gap-3">
        <select value={product} onChange={(e) => { setProduct(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All products</option>{products?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
        <select value={operationType} onChange={(e) => { setOperationType(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All types</option><option value="receipt">Receipt</option><option value="delivery">Delivery</option><option value="transfer">Transfer</option><option value="adjustment">Adjustment</option></select>
        <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"><option value="">All locations</option>{warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}</select>
      </div>
      <DataTable columns={columns} data={ledger} loading={loading} emptyMessage="No ledger entries" />
      {total > 20 && <div className="flex items-center justify-between"><p className="text-sm text-slate-600">Page {page} of {Math.ceil(total / 20)}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Previous</button><button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50">Next</button></div></div>}
    </div>
  );
}
