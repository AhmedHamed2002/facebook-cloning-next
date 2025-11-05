"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
const router = useRouter();

useEffect(() => {
    const token = localStorage.getItem("facebook_token");
    if (!token) {
        router.push("/login");
    }
}, [router]);
}
