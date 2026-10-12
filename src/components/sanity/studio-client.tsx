"use client";

import dynamic from "next/dynamic";

export const StudioClient = dynamic(
  () => import("@/components/sanity/studio-renderer"),
  {
    ssr: false,
    loading: () => (
      <div
        aria-live="polite"
        className="flex min-h-screen items-center justify-center text-sm text-neutral-600"
        role="status"
      >
        Loading Sanity Studio...
      </div>
    ),
  },
);
