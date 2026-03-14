"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError("Passwords do not match");
        setError(""); setSuccess(""); setLoading(true);
        try {
            await api.post("/auth/reset-password", { email, otp, newPassword, confirmPassword });
            setSuccess("Password reset successfully! Redirecting...");
            setTimeout(() => router.push("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Reset failed");
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex flex-col items-center mb-6">
                <Logo textClass="text-2xl font-bold text-[var(--color-zoho-blue)]" className="w-10 h-10 mb-2" />
                <h2 className="text-xl font-bold text-gray-800">Set New Password</h2>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100 text-center">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-6 border border-green-100 text-center">{success}</div>}

            <form onSubmit={handleReset} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} disabled className="w-full px-4 py-2 border border-gray-300 rounded text-sm bg-gray-50 text-gray-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                    <input
                        type="text" required maxLength="6"
                        className="w-full px-4 py-2 border border-gray-300 rounded text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:border-[var(--color-zoho-blue)]"
                        placeholder="------" value={otp} onChange={(e) => setOtp(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"} required
                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] pr-10"
                            placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"} required
                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[var(--color-zoho-blue)] pr-10"
                            placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[var(--color-zoho-blue)] text-white py-2.5 rounded font-medium hover:bg-[var(--color-zoho-dark-blue)] transition mt-4 disabled:bg-blue-300">
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <div className="mt-6 flex justify-center text-sm">
                <Link href="/login" className="text-gray-500 hover:text-gray-900 underline">Back to Login</Link>
            </div>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-8">
            <Suspense fallback={<div className="text-gray-500">Loading form...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
