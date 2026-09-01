"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "../../lib/api-client";
import { authService } from "../../lib/auth-service";
import { authStorage } from "../../lib/auth-storage";
import { getSessionState } from "../../lib/session";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [apiError, setApiError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    getSessionState().then((session) => {
      if (session.authenticated) {
        router.replace(session.profileComplete ? (searchParams.get("next") || "/dashboard") : "/profile");
      }
    });
  }, [router, searchParams]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setApiError("");
    try {
      const result = await authService.login(values);
      authStorage.setToken(result.access_token);
      setSignedIn(true);
      const session = await getSessionState();
      router.replace(session.profileComplete ? (searchParams.get("next") || "/dashboard") : "/profile");
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : "Unable to sign in right now.");
    }
  };

  return <main className="min-h-[calc(100vh-77px)] bg-[#fff8f3] px-6 py-16">
    <section className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft sm:p-10">
      <p className="text-sm font-bold text-coral-500">Welcome back</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">Sign in to Activio</h1>
      <p className="mt-3 text-ink/60">Pick up where you left off and find your next thing.</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {apiError && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{apiError}</div>}
        {signedIn && <div role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">You’re signed in. Your session is saved in this browser.</div>}
        <Field label="Email" id="login-email" error={errors.email?.message}><input id="login-email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "login-email-error" : undefined} {...register("email")} /></Field>
        <Field label="Password" id="login-password" error={errors.password?.message}><input id="login-password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} aria-describedby={errors.password ? "login-password-error" : undefined} {...register("password")} /></Field>
        <button disabled={isSubmitting} className="w-full rounded-full bg-coral-500 px-5 py-3.5 font-bold text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-7 text-center text-sm text-ink/60">New to Activio? <Link className="font-bold text-indigo-600 hover:underline" href="/register">Create an account</Link></p>
    </section>
  </main>;
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">{label}</label>{children}{error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-600">{error}</p>}</div>;
}
