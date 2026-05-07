"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";

export function BillingPortalButton({ locale }: { locale: string }) {
  const t = useTranslations("Billing");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-navy-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-navy-hover transition-colors disabled:opacity-60"
    >
      {loading ? "…" : t("manageSubscription")}
      {!loading && <ExternalLink className="h-3 w-3" />}
    </button>
  );
}
