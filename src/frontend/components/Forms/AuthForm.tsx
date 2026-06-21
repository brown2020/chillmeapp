"use client";

import { Button, Input, PasswordInput, GoogleIcon } from "@chill-ui";
import { useAuth } from "@frontend/hooks";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AuthShell from "./AuthShell";

type FormVals = {
  email: string;
  password: string;
};

const AuthForm = () => {
  const { signinWithGoogle, loginWithEmail } = useAuth();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>();

  const onSubmit = async (data: FormVals) => {
    await loginWithEmail(data.email, data.password);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signinWithGoogle();
    } catch {
      // The auth hook already shows the user-facing error toast.
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Chill.me"
      description="Start a meeting, join a room, or review the sessions you have already hosted."
    >
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.email)}
              {...register("email", { required: "Email is required" })}
              error={Boolean(errors.email)}
              errorMessage={errors.email?.message}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.password)}
              {...register("password", {
                required: "Password is required",
              })}
              error={Boolean(errors.password)}
              errorMessage={errors.password?.message}
            />
          </div>

          <Button
            disabled={isSubmitting || isGoogleSubmitting}
            type="submit"
            className="h-11 w-full gap-2"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2 bg-background"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting || isGoogleSubmitting}
        >
          <GoogleIcon className="h-4 w-4" />
          {isGoogleSubmitting ? "Opening Google..." : "Continue with Google"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to Chill.me?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default AuthForm;
