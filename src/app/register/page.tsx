"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        gender: "",
        address: "",
        city: "",
        birthday: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const router = useRouter();

    // ✅ Sync with dark mode (from localStorage)
    useEffect(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
    }, []);

    // ✅ Handle file upload preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        setAvatar(file);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
        }
    };

    // ✅ Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ✅ Handle registration
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
        Swal.fire({
            icon: "warning",
            title: "Passwords do not match",
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
        });
        return;
        }

        setLoading(true);
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
        formData.append(key, form[key as keyof typeof form]);
        });
        if (avatar) formData.append("profileImage", avatar);

        try {
        const res = await userService.register(formData);
        setLoading(false);

        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: res.data || "Account created successfully!",
            showConfirmButton: false,
            timer: 2500,
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
            });
            router.push("/login");
        } else if (res.status === "fail") {
            Swal.fire({
            icon: "warning",
            title: "Registration Failed",
            text: res.data || "Please check your inputs.",
            confirmButtonColor: "#f1c40f",
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
            });
        } else {
            throw new Error(res.message || "Unknown error");
        }
        } catch (err: any) {
        setLoading(false);
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: err.message || "Registration failed",
            confirmButtonColor: "#e74c3c",
            background: isDark ? "#1b1b1b" : "#fff",
            color: isDark ? "#f3f4f6" : "#111827",
        });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-neutral-900">
        <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-blue-600">Create a new account</h1>
            <p className="text-gray-600 dark:text-gray-300">It’s quick and easy.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
                <label
                htmlFor="avatarInput"
                className="cursor-pointer w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 transition"
                >
                {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    </svg>
                )}
                </label>
                <input id="avatarInput" type="file" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                required
                />
                <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
                required
                />
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
                required
                />
                <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Address"
                required
                />
            </div>

            {/* City */}
            <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City"
                required
            />

            {/* Gender & Birthday */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                </select>

                <input
                type="date"
                name="birthday"
                value={form.birthday}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New password"
                required
                />
                <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password"
                required
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-semibold transition disabled:bg-green-400"
            >
                {loading ? "Registering..." : "Sign Up"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-300">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                </Link>
            </p>
            </form>
        </div>
        </div>
    );
}
