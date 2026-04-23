"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

function LoginFormInner() {
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered") === "true";
  const confirm = searchParams.get("confirm") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(t("errorInvalid"));
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t("title")}</h1>
        <p className="text-foreground/60">{t("subtitle")}</p>
      </div>

      {registered && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-sm">
          {t("registered")}
        </div>
      )}

      {confirm && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm">
          {t("successConfirmation")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("emailPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end mt-1.5">
            <Link
              href="/reset-password"
              className="text-xs text-navy-accent hover:underline font-medium"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-navy-primary text-white font-semibold hover:bg-navy-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t("submitting") : t("submit")}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-foreground/60 font-medium tracking-wider">
              OR
            </span>
          </div>
        </div>

        <GoogleSignInButton text={t("signInWithGoogle")} callbackUrl={callbackUrl} />
      </form>

      <p className="text-center text-sm text-foreground/60 mt-6">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-navy-accent hover:underline font-medium">
          {t("createOne")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse bg-foreground/5 rounded-xl" />}>
      <LoginFormInner />
    </Suspense>
  );
}
