"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email || !otp || !newPassword) return;

        setLoading(true);
        try {
        const res = await userService.resetPassword({
            email,
            code: otp,
            newPassword,
        });

        setLoading(false);

        if (res.status === "success") {
            Swal.fire({
            toast: true,
            position: "top",
            icon: "success",
            title: res.message || "Password reset successful!",
            showConfirmButton: false,
            timer: 3000,
            background: document.documentElement.classList.contains("dark")
                ? "#1b1b1b"
                : "#fff",
            color: document.documentElement.classList.contains("dark")
                ? "#f3f4f6"
                : "#111",
            });
            router.push("/login");
        } else {
            throw new Error(res.message || "Failed to reset password");
        }
        } catch (err: any) {
        setLoading(false);
        Swal.fire({
            toast: true,
            position: "top",
            icon: "error",
            title: err.message || "Something went wrong",
            showConfirmButton: false,
            timer: 3000,
            background: document.documentElement.classList.contains("dark")
            ? "#1b1b1b"
            : "#fff",
            color: document.documentElement.classList.contains("dark")
            ? "#f3f4f6"
            : "#111",
        });
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-neutral-900 px-4">
        <Card className="w-full max-w-sm bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Reset Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
                <Label htmlFor="email" className="text-sm font-medium">
                Email Address
                </Label>
                <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1"
                required
                />
            </div>

            {/* OTP Code */}
            <div>
                <Label className="text-sm font-medium mb-2 block">Reset Code</Label>
                <div className="flex justify-center">
                <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                >
                    <InputOTPGroup>
                    {[...Array(6)].map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                    ))}
                    </InputOTPGroup>
                </InputOTP>
                </div>
            </div>

            {/* New Password */}
            <div>
                <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
                </Label>
                <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1"
                required
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
                {loading ? "Resetting..." : "Reset Password"}
            </Button>

            {/* Divider */}
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
                <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                Back to Login
                </a>
            </div>
            </form>
        </Card>
        </div>
    );
}
