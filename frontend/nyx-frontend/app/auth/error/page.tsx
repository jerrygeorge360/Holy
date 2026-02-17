"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ErrorContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get("message") || "An unknown error occurred.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="max-w-md text-center bg-white border border-red-200 rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl font-bold">!</span>
                </div>
                <h1 className="text-xl font-semibold text-black mb-2">
                    Authentication Failed
                </h1>
                <p className="text-slate-600 mb-6 text-sm">{message}</p>
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-black text-white text-sm rounded-full hover:bg-slate-800 transition-colors"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <p className="text-slate-600">Loading...</p>
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}
