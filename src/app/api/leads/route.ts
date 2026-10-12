import { NextResponse } from "next/server";
import { getUtmParametersFromRecord } from "@/features/attribution/utm";

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  whatsapp?: unknown;
  website?: unknown;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return NextResponse.json({ received: true }, { status: 202 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const whatsapp =
    typeof payload.whatsapp === "string" ? payload.whatsapp.trim() : "";
  if (
    name.length < 1 ||
    name.length > 120 ||
    email.length > 254 ||
    !isValidEmail(email) ||
    whatsapp.length > 32
  ) {
    return NextResponse.json(
      { error: "Enter a valid name, email, and WhatsApp number." },
      { status: 400 },
    );
  }

  const webhookValue = process.env.LEAD_CAPTURE_WEBHOOK_URL;
  const WebhookSecret = process.env.WEBHOOK_SECRET;
  if (!webhookValue) {
    return NextResponse.json(
      { error: "Lead capture is not configured." },
      { status: 503 },
    );
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(webhookValue);
  } catch {
    return NextResponse.json(
      { error: "Lead capture is not configured correctly." },
      { status: 503 },
    );
  }
  if (webhookUrl.protocol !== "https:") {
    return NextResponse.json(
      { error: "Lead capture must use a secure webhook URL." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-make-apikey": WebhookSecret || "",
      },
      body: JSON.stringify({
        name,
        email,
        whatsapp,
        ...getUtmParametersFromRecord(payload),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "The lead service rejected the request." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "The lead service is temporarily unavailable." },
      { status: 502 },
    );
  }

  return NextResponse.json({ received: true }, { status: 202 });
}
