'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BarChart } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      router.push('/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-zoho-blue)] border-t-transparent" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-100 py-4 px-8 flex justify-between items-center">
        <Logo className="w-8 h-8" textClass="text-2xl font-bold" />
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-[var(--color-zoho-blue)] transition">
            Log In
          </Link>
          <Link href="/signup" className="px-5 py-2 text-sm font-medium bg-[var(--color-zoho-blue)] text-white rounded hover:bg-[var(--color-zoho-dark-blue)] transition">
            Sign Up Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-[var(--color-zoho-blue)] text-sm font-semibold mb-2 border border-blue-100">
            Enterprise Inventory Management
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
            Take Control of Your <br />
            <span className="text-[var(--color-zoho-blue)]">Stock Operations.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
            StockFlow is a professional, unified platform designed to streamline your inventory operations. Track receipts, manage deliveries, and optimize warehouse efficiency with a system built for speed and accuracy.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/signup" className="flex items-center gap-2 px-8 py-3.5 bg-[var(--color-zoho-blue)] text-white rounded text-lg font-medium hover:bg-[var(--color-zoho-dark-blue)] transition shadow-sm">
              Get Started for Free <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
            alt="Warehouse Management"
            className="rounded-lg shadow-2xl border border-gray-100 object-cover h-[450px] w-full"
          />
        </div>
      </main>

      {/* Feature Highlight */}
      <section className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Built for Modern Warehousing</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-[var(--color-zoho-blue)] flex items-center justify-center rounded-lg mb-6">
                <BarChart size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Dashboards</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Monitor your multi-warehouse stock in real time. Predict shortages and act before a stockout occurs.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-[var(--color-zoho-blue)] flex items-center justify-center rounded-lg mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Operations</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Strict validations ensure stock is accurately tracked. The stock ledger keeps an immutable history of all moves.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 text-[var(--color-zoho-blue)] flex items-center justify-center rounded-lg mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Adjustments</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Fix system mismatches immediately with auditable adjustments and internal transfer orders.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
