"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { userService } from "@/services/userService";
import Link from "next/link";

export default function LoginForm() {
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({ email: false, password: false });

    useEffect(() => {
        setIsDarkMode(localStorage.getItem("theme") === "dark");

        const token = localStorage.getItem("facebook_token");
        if (token) {
        userService
            .checkToken()
            .then((res) => {
            if (res.status === "success") {
                localStorage.setItem("facebook_logged", "true");
                Swal.fire({
                toast: true,
                position: "top-end",
                icon: "info",
                title: "You are already logged in",
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
                background: isDarkMode ? "#1b1b1b" : "#fff",
                color: isDarkMode ? "#f3f4f6" : "#111827",
                });
                router.push("/home");
            }
            })
            .catch(() => localStorage.removeItem("facebook_token"));
        }
    }, [isDarkMode, router]);

    // 🔹 Submit handler
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
        const res = await userService.login({ email, password });
        setLoading(false);

        if (res.status === "success") {
            localStorage.setItem("facebook_token", res.token);
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.data || "Login successful",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: isDarkMode ? "#1b1b1b" : "#fff",
            color: isDarkMode ? "#f3f4f6" : "#111827",
            });
            router.push("/home");
        } else {
            Swal.fire({
            icon: "warning",
            title: "Warning!",
            text: res.data || "Login failed",
            confirmButtonColor: "#f1c40f",
            background: isDarkMode ? "#1b1b1b" : "#fff",
            color: isDarkMode ? "#f3f4f6" : "#111827",
            });
        }
        } catch (err: any) {
        setLoading(false);
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err?.message || "Login failed",
            confirmButtonColor: "#e74c3c",
            background: isDarkMode ? "#1b1b1b" : "#fff",
            color: isDarkMode ? "#f3f4f6" : "#111827",
        });
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
            <input
                type="email"
                id="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2
                        focus:ring-blue-500 focus:outline-none px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100"
            />
            {touched.email && !/\S+@\S+\.\S+/.test(email) && (
                <p className="text-red-500 text-sm mt-1">Enter a valid email</p>
            )}
            </div>

            {/* Password */}
            <div>
            <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2
                        focus:ring-blue-500 focus:outline-none px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100"
            />
            {touched.password && !password && (
                <p className="text-red-500 text-sm mt-1">Password is required</p>
            )}
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4
                        focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-lg px-5 py-2.5 text-center
                        disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
            {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Forgot password */}
            <div className="text-center mt-2">
            <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                Forgotten password?
            </Link>
            </div>

            <hr className="my-4 border-gray-300 dark:border-gray-600" />

            {/* Create account */}
            <div className="text-center">
            <Link
                href="/register"
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg"
            >
                Create New Account
            </Link>
            </div>
        </form>
        </div>
    );
}
