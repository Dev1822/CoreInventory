"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import Logo from "@/components/Logo";

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            const res = await api.post("/auth/verify-otp", { email, otp });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setSuccess("Email verified successfully! Redirecting to dashboard...");
            setTimeout(() => router.push("/dashboard"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError(""); setSuccess("");
        try {
            await api.post("/auth/resend-otp", { email });
            setSuccess("A new OTP has been sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP");
        }
    };

    return (
        <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex flex-col items-center mb-8">
                <Logo textClass="text-2xl font-bold text-[var(--color-zoho-blue)]" className="w-10 h-10 mb-2" />
                <h2 className="text-xl font-bold text-gray-800">Verify Your Email</h2>
                <p className="text-gray-500 text-sm mt-1 text-center">
                    We sent a 6-digit code to <br /><span className="font-semibold text-gray-700">{email}</span>
                </p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-6 border border-red-100 text-center">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded text-sm mb-6 border border-green-100 text-center">{success}</div>}

            <form onSubmit={handleVerify} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP Code</label>
                    <input
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:border-[var(--color-zoho-blue)] focus:ring-1 focus:ring-[var(--color-zoho-blue)] transition"
                        placeholder="------"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full bg-[var(--color-zoho-blue)] text-white py-2.5 rounded font-medium hover:bg-[var(--color-zoho-dark-blue)] transition disabled:bg-blue-300"
                >
                    {loading ? "Verifying..." : "Verify Email"}
                </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-500">
                <div>
                    Didn't receive the code?{" "}
                    <button onClick={handleResend} className="text-[var(--color-zoho-blue)] hover:underline font-medium">
                        Resend OTP
                    </button>
                </div>
                <Link href="/login" className="text-gray-500 hover:text-gray-900 underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function VerifyOtp() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <Suspense fallback={<div className="text-gray-500">Loading form...</div>}>
                <VerifyOtpContent />
            </Suspense>
        </div>
    );
}
