"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function Login() {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await api.post("/auth/login", { loginId, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            router.push("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <Logo textClass="text-2xl font-bold" className="w-10 h-10 mb-2" />
                    <p className="text-gray-500 text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition"
                            placeholder="e.g., manager123"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link href="/forgot-password" className="text-sm text-[var(--color-zoho-blue)] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition pr-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-zoho-blue)] text-white py-2.5 rounded font-medium hover:bg-[var(--color-zoho-dark-blue)] transition mt-2 disabled:bg-blue-300"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[var(--color-zoho-blue)] hover:underline font-medium">
                        Sign Up Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
