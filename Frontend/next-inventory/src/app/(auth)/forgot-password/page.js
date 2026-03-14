"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import Logo from "@/components/Logo";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to process request");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <Logo textClass="text-2xl font-bold" className="w-10 h-10 mb-2" />
                    <h2 className="text-xl font-bold text-gray-800">Forgot Password</h2>
                    <p className="text-gray-500 text-sm mt-1 text-center">Enter your email and we'll send you an OTP to reset your password.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-zoho-blue)] text-white py-2.5 rounded font-medium hover:bg-[var(--color-zoho-dark-blue)] transition disabled:bg-blue-300"
                    >
                        {loading ? "Sending OTP..." : "Send Reset OTP"}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-500">
                    <Link href="/login" className="text-gray-500 hover:text-gray-900 underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
