'use client';

export default function DataTable({ columns, data, loading, emptyMessage = 'No records found' }) {
    if (loading) {
        return (
            <div className="flex animate-pulse flex-col space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 w-full rounded-lg bg-slate-100" />
                ))}
            </div>
        );
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-slate-500">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                        {columns?.map((col) => (
                            <th key={col.key} className="px-5 py-3 first:pl-6">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data?.map((row, i) => (
                        <tr key={row._id || i} className="hover:bg-slate-50/50 transition-colors">
                            {columns?.map((col) => (
                                <td key={col.key} className="px-5 py-4 first:pl-6">
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
