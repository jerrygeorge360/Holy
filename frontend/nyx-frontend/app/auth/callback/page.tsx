"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Suspense } from "react";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState("Signing you in...");

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            login(token);
            setStatus("Success! Redirecting...");
            setTimeout(() => router.push("/dashboard"), 1000);
        } else {
            setStatus("No token received.");
            setTimeout(() => router.push("/"), 2000);
        }
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 text-lg">{status}</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <p className="text-slate-600">Loading...</p>
                </div>
            }
        >
            <CallbackHandler />
        </Suspense>
    );
}
