"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { userService } from "@/services/userService"; // adjust path as needed

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState(false);

    const isEmailValid = /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) {
        setTouched(true);
        return;
        }

        try {
        setLoading(true);
        const res = await userService.forgotPassword(email);
        setLoading(false);

        const isDark = document.documentElement.classList.contains("dark");

        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.message || "Reset link sent successfully!",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
            });

            router.push("/reset-password");
        } else {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "warning",
            title: res.data || "Failed to send email",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
            });
        }
        } catch (err: any) {
        setLoading(false);
        const isDark = document.documentElement.classList.contains("dark");
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "error",
            title: "Something went wrong!",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
        });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-neutral-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
            Find Your Account
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email
                </label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2
                focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                bg-transparent text-gray-900 dark:text-gray-100"
                />
                {!email && touched && (
                <p className="text-red-500 text-sm mt-1">Email is required</p>
                )}
                {email && !isEmailValid && touched && (
                <p className="text-red-500 text-sm mt-1">Enter a valid email</p>
                )}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between space-x-3">
                <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex-1 text-center bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-100
                rounded-md py-2 font-medium hover:bg-gray-300 dark:hover:bg-neutral-600"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={loading || !isEmailValid}
                className="cursor-pointer flex-1 text-center bg-[#1877f2] hover:bg-blue-700 text-white font-medium
                rounded-md py-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                {loading ? "Sending..." : "Search"}
                </button>
            </div>
            </form>

            {/* Footer */}
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
            <a
                href="/register"
                className="text-[#1877f2] hover:underline font-medium"
            >
                Create new account
            </a>
            </p>
        </div>
        </div>
    );
}
