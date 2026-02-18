"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Suspense } from "react";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState("Signing you in...");

    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        const token = searchParams.get("token");
        if (token) {
            called.current = true;
            login(token);
            setStatus("Success! Redirecting...");
            router.push("/dashboard");
        } else {
            called.current = true;
            setStatus("No token received.");
            router.push("/");
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
