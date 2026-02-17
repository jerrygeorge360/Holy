/**
 * Central configuration file for the Holy frontend.
 * Change NEXT_PUBLIC_BACKEND_URL in .env.local to swap the backend.
 */

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
