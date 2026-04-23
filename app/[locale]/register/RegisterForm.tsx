"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Briefcase, User, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

type Role = "EMPLOYER" | "CANDIDATE";

function RegisterFormInner() {
  const t = useTranslations("Register");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRequirements = [
    { id: "length", regex: /.{8,}/, label: t("reqLength") },
    { id: "lowercase", regex: /[a-z]/, label: t("reqLowercase") },
    { id: "uppercase", regex: /[A-Z]/, label: t("reqUppercase") },
    { id: "number", regex: /[0-9]/, label: t("reqNumber") },
    { id: "special", regex: /[!@#$%^&*]/, label: t("reqSpecial") },
  ];

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    passwordRequirements.forEach(req => {
      if (req.regex.test(password)) strength++;
    });
    return strength;
  };

  const strength = getPasswordStrength();
  
  const getStrengthLabel = () => {
    if (strength <= 2) return t("strengthWeak");
    if (strength === 3) return t("strengthFair");
    if (strength === 4) return t("strengthStrong");
    return t("strengthVeryStrong");
  };

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength === 3) return "bg-yellow-500";
    if (strength === 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthTextColor = () => {
    if (strength <= 2) return "text-red-500";
    if (strength === 3) return "text-yellow-600 dark:text-yellow-500";
    if (strength === 4) return "text-blue-500";
    return "text-green-500";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (strength < 5) {
      setError(t("errorPasswordLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errorPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push("/login?confirm=true");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">{t("title")}</h1>
        <p className="text-foreground/60">{t("subtitle")}</p>
      </div>

      <div className="flex p-1 bg-foreground/5 rounded-2xl mb-6 relative">
        <div 
          className="absolute inset-y-1 transition-all duration-300 ease-in-out bg-navy-accent rounded-xl shadow-lg"
          style={{ 
            width: "calc(50% - 4px)", 
            left: role === "CANDIDATE" ? "4px" : "calc(50% + 0px)" 
          }}
        />
        <button
          type="button"
          onClick={() => setRole("CANDIDATE")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2 font-bold transition-colors duration-300 ${
            role === "CANDIDATE" ? "text-white" : "text-foreground/40 hover:text-foreground/60"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t("jobSeeker")}</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("EMPLOYER")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2 font-bold transition-colors duration-300 ${
            role === "EMPLOYER" ? "text-white" : "text-foreground/40 hover:text-foreground/60"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{t("employer")}</span>
        </button>
      </div>

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
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition shadow-sm"
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
              className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition pr-12 shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <p className={`text-xs font-bold uppercase tracking-wider ${getStrengthTextColor()}`}>
                  {getStrengthLabel()}
                </p>
              </div>
              <div className="h-1 w-full bg-foreground/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>

              <div className="p-3 rounded-xl bg-foreground/5 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {passwordRequirements.map((req) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      {isMet ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-foreground/20" />
                      )}
                      <span className={`text-xs ${isMet ? "text-green-600 dark:text-green-400 font-medium" : "text-foreground/40"}`}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t("confirmPasswordPlaceholder")}
            className="w-full px-4 py-3 rounded-xl border border-foreground/20 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:border-transparent transition shadow-sm"
          />
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-foreground/40 tracking-[0.2em]">
            <span className="bg-background px-3">
              OR
            </span>
          </div>
        </div>

        <GoogleSignInButton text={t("signInWithGoogle")} role={role} />
      </form>

      <p className="text-center text-sm text-foreground/60 mt-6">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-navy-accent hover:underline font-medium">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse bg-foreground/5 rounded-xl" />}>
      <RegisterFormInner />
    </Suspense>
  );
}
