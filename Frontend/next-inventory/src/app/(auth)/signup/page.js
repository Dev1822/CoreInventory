"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function Signup() {
    const [form, setForm] = useState({ loginId: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const handleSignup = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return setError("Passwords do not match");
        }
        setError("");
        setLoading(true);
        try {
            await api.post("/auth/signup", {
                loginId: form.loginId,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword
            });
            // Redirect to OTP verification page
            router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <Logo textClass="text-2xl font-bold" className="w-10 h-10 mb-2" />
                    <p className="text-gray-500 text-sm">Create your manager account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
                        <input
                            type="text"
                            required
                            minLength="6"
                            maxLength="12"
                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition"
                            placeholder="Min 6 characters"
                            value={form.loginId}
                            onChange={(e) => setForm({ ...form, loginId: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition pr-10"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                        <p className="text-xs text-gray-400 mt-1">Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special char.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition pr-10"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--color-zoho-blue)] text-white py-2.5 rounded font-medium hover:bg-[var(--color-zoho-dark-blue)] transition mt-4 disabled:bg-blue-300"
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--color-zoho-blue)] hover:underline font-medium">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
