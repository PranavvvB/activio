"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "../../lib/api-client";
import { authService } from "../../lib/auth-service";

const schema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Choose a username with at least 2 characters."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [apiError, setApiError] = useState("");
  const [created, setCreated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async ({
    confirmPassword: _confirmPassword,
    ...values
  }: FormValues) => {
    setApiError("");
    try {
      await authService.register(values);
      setCreated(true);
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : "Unable to create your account right now.",
      );
    }
  };

  return (
    <main className="min-h-[calc(100vh-77px)] bg-[#fff8f3] px-6 py-16">
      <section className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-soft sm:p-10">
        {created ? (
          <div role="status">
            <p className="text-sm font-bold text-coral-500">You’re in</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
              Account created!
            </h1>
            <p className="mt-3 text-ink/60">
              Your Activio account is ready. Sign in to continue.
            </p>
            <Link
              className="mt-8 inline-flex w-full justify-center rounded-full bg-coral-500 px-5 py-3.5 font-bold text-white hover:bg-coral-600"
              href="/login"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-coral-500">Start moving</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
              Join Activio
            </h1>
            <p className="mt-3 text-ink/60">
              Create your account and meet your kind of people.
            </p>
            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {apiError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {apiError}
                </div>
              )}
              <Field
                label="Username"
                id="register-username"
                error={errors.username?.message}
              >
                <input
                  id="register-username"
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  aria-describedby={
                    errors.username ? "register-username-error" : undefined
                  }
                  {...register("username")}
                />
              </Field>
              <Field
                label="Email"
                id="register-email"
                error={errors.email?.message}
              >
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? "register-email-error" : undefined
                  }
                  {...register("email")}
                />
              </Field>
              <Field
                label="Password"
                id="register-password"
                error={errors.password?.message}
              >
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "register-password-error" : undefined
                  }
                  {...register("password")}
                />
              </Field>
              <Field
                label="Confirm password"
                id="register-confirm"
                error={errors.confirmPassword?.message}
              >
                <input
                  id="register-confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword
                      ? "register-confirm-error"
                      : undefined
                  }
                  {...register("confirmPassword")}
                />
              </Field>
              <button
                disabled={isSubmitting}
                className="w-full rounded-full bg-coral-500 px-5 py-3.5 font-bold text-white transition hover:bg-coral-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </form>
            <p className="mt-7 text-center text-sm text-ink/60">
              Already have an account?{" "}
              <Link
                className="font-bold text-indigo-600 hover:underline"
                href="/login"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
