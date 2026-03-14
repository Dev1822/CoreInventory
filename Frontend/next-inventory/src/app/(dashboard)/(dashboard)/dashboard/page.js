'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardAPI } from '../../../services/api';

const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    waiting: 'bg-amber-100 text-amber-800',
    ready: 'bg-blue-100 text-blue-800',
    done: 'bg-emerald-100 text-emerald-800',
    canceled: 'bg-red-100 text-red-800',
    picking: 'bg-amber-100 text-amber-800',
    packing: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-amber-100 text-amber-800',
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [filters, setFilters] = useState({ documentType: '', status: '', warehouse: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            dashboardAPI.getStats(),
            dashboardAPI.getActivity(filters),
            dashboardAPI.getAlerts(),
        ])
            .then(([s, a, al]) => {
                setStats(s.data.data);
                setActivity(a.data.data);
                setAlerts(al.data.data || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [filters.documentType, filters.status, filters.warehouse]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-zoho-blue border-t-transparent" />
            </div>
        );
    }

    const kpis = [
        { label: 'Total Products in Stock', value: stats?.totalProductsInStock ?? 0, link: '/dashboard/products', valueClass: 'text-zoho-blue font-semibold' },
        { label: 'Low Stock / Out of Stock', value: (stats?.lowStockCount ?? 0) + (stats?.outOfStockCount ?? 0), link: '/dashboard/alerts', valueClass: 'text-amber-600' },
        { label: 'Pending Receipts', value: stats?.pendingReceipts ?? 0, link: '/dashboard/receipts', valueClass: 'text-blue-600' },
        { label: 'Pending Deliveries', value: stats?.pendingDeliveries ?? 0, link: '/dashboard/deliveries', valueClass: 'text-violet-600' },
        { label: 'Scheduled Transfers', value: stats?.scheduledTransfers ?? 0, link: '/dashboard/transfers', valueClass: 'text-emerald-600' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-slate-600">Inventory overview and key metrics</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {kpis.map((kpi) => (
                    <Link
                        key={kpi.label}
                        href={kpi.link}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
                    >
                        <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                        <p className={`mt-2 text-2xl font-bold ${kpi.valueClass}`}>{kpi.value}</p>
                    </Link>
                ))}
            </div>

            {alerts.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <h2 className="font-semibold text-amber-900">Low Stock Alerts</h2>
                    <p className="text-sm text-amber-800">{alerts.length} product(s) need attention</p>
                    <Link href="/dashboard/alerts" className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline">
                        View all →
                    </Link>
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <select
                    value={filters.documentType}
                    onChange={(e) => setFilters((f) => ({ ...f, documentType: e.target.value }))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"
                >
                    <option value="">All document types</option>
                    <option value="receipts">Receipts</option>
                    <option value="deliveries">Deliveries</option>
                    <option value="transfers">Transfers</option>
                </select>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-zoho-blue focus:outline-none focus:ring-1 focus:ring-zoho-blue"
                >
                    <option value="">All statuses</option>
                    <option value="draft">Draft</option>
                    <option value="waiting">Waiting</option>
                    <option value="ready">Ready</option>
                    <option value="done">Done</option>
                    <option value="canceled">Canceled</option>
                </select>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
                    <h2 className="font-semibold text-slate-900">Recent Receipts</h2>
                    <div className="mt-4 space-y-2">
                        {(activity?.receipts || []).slice(0, 5).map((r) => (
                            <Link
                                key={r._id}
                                href={`/dashboard/receipts/${r._id}/edit`}
                                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                            >
                                <span className="font-medium text-slate-800">{r.supplier}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[r.status] || 'bg-slate-100'}`}>
                                    {r.status}
                                </span>
                            </Link>
                        ))}
                        {(!activity?.receipts || activity.receipts.length === 0) && (
                            <p className="text-sm text-slate-500">No recent receipts</p>
                        )}
                    </div>
                    <Link href="/dashboard/receipts" className="mt-3 inline-block text-sm text-zoho-blue hover:underline font-medium">
                        View all receipts →
                    </Link>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                    <h2 className="font-semibold text-slate-900">Recent Deliveries</h2>
                    <div className="mt-4 space-y-2">
                        {(activity?.deliveries || []).slice(0, 5).map((d) => (
                            <Link
                                key={d._id}
                                href={`/dashboard/deliveries/${d._id}/edit`}
                                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                            >
                                <span className="font-medium text-slate-800">{d.customer}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[d.status] || 'bg-slate-100'}`}>
                                    {d.status}
                                </span>
                            </Link>
                        ))}
                        {(!activity?.deliveries || activity.deliveries.length === 0) && (
                            <p className="text-sm text-slate-500">No recent deliveries</p>
                        )}
                    </div>
                    <Link href="/dashboard/deliveries" className="mt-3 inline-block text-sm text-zoho-blue hover:underline font-medium">
                        View all →
                    </Link>
                </div>
            </div>
        </div>
    );
}
