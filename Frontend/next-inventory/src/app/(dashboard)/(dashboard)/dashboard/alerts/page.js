'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardAPI } from '../../../../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { dashboardAPI.getAlerts().then((res) => setAlerts(res.data.data || [])).catch(() => { }).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-2 border-zoho-blue border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1><p className="mt-1 text-slate-600">Products at or below reorder threshold</p></div>
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500">No low stock alerts. All products are above their reorder threshold.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert, i) => (
            <Link key={alert.product?.id || i} href={`/dashboard/products/${alert.product?.id}/edit`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{alert.product?.name}</p>
                  <p className="text-sm text-slate-500 font-mono">{alert.product?.sku}</p>
                  <p className="mt-2 text-sm text-slate-600">Current: <strong>{alert.currentStock}</strong>{alert.reorderThreshold > 0 && <> · Threshold: <strong>{alert.reorderThreshold}</strong></>}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${alert.isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{alert.isOutOfStock ? 'Out of stock' : 'Low stock'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
