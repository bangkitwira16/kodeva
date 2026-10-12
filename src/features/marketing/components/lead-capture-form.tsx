"use client";

import { useState, type FormEvent } from "react";
import { useId } from "react";
import { appendUtmParameters, type UtmParameters } from "@/features/attribution/utm";
import { useUtmParameters } from "@/features/attribution/utm-provider";

export type LeadCaptureData = UtmParameters & {
  name: string;
  email: string;
  whatsapp: string;
};

type LeadCaptureFormProps = {
  onSubmit?: (data: LeadCaptureData) => Promise<void>;
  submitLabel?: string;
};

type FormStatus = "idle" | "loading" | "success" | "error";

export function LeadCaptureForm({
  onSubmit,
  submitLabel = "Get in touch",
}: LeadCaptureFormProps) {
  const id = useId();
  const utmParameters = useUtmParameters();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    // This off-screen field is a honeypot for basic automated submissions.
    if (String(formData.get("website") ?? "").trim()) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const data = appendUtmParameters({
        name: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      }, utmParameters);
      if (onSubmit) {
        await onSubmit(data);
      } else {
        const response = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Lead submission failed.");
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(
        "We couldn't send your message. Please try again in a moment.",
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-900" htmlFor={`${id}-name`}>
          Name
        </label>
        <input
          autoComplete="name"
          className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-950 outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900"
          id={`${id}-name`}
          maxLength={120}
          name="name"
          placeholder="Your name"
          required
          type="text"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-900" htmlFor={`${id}-email`}>
          Email
        </label>
        <input
          autoComplete="email"
          className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-950 outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900"
          id={`${id}-email`}
          maxLength={254}
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-900" htmlFor={`${id}-whatsapp`}>
          WhatsApp <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          autoComplete="tel"
          className="min-h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-950 outline-none focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900"
          id={`${id}-whatsapp`}
          maxLength={32}
          name="whatsapp"
          placeholder="+1 555 010 1234"
          type="tel"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input
          autoComplete="off"
          id={`${id}-website`}
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>
      <button
        className="min-h-11 w-full rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-wait disabled:opacity-60"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Sending..." : submitLabel}
      </button>
      <div aria-live="polite" className="min-h-6 text-sm" role="status">
        {status === "loading" && (
          <p className="text-neutral-600">Sending your message...</p>
        )}
        {status === "success" && (
          <p className="text-emerald-800">Thanks! Your message has been received.</p>
        )}
      </div>
      {status === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
