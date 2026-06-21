"use client";

import { Button, Input } from "@chill-ui";
import { useAuth } from "@frontend/hooks";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import AuthShell from "./AuthShell";

type FormVals = {
  email: string;
};

const ForgotPasswordForm = () => {
  const { sendPasswordReset } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormVals>();

  const onSubmit = async (data: FormVals) => {
    const success = await sendPasswordReset(data.email);
    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <AuthShell
        eyebrow="Password reset"
        title="Check your email"
        description="We sent password reset instructions to the email address you provided."
      >
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
            Sent to{" "}
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              try again
            </button>
            .
          </p>
          <Button variant="outline" asChild className="h-11 w-full gap-2">
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password"
      description="Enter the email for your account and we will send a link to get you back in."
    >
      <div className="w-full max-w-md space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11 bg-background"
              aria-invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
              error={Boolean(errors.email)}
              errorMessage={errors.email?.message}
            />
          </div>

          <Button
            disabled={isSubmitting}
            type="submit"
            className="h-11 w-full gap-2"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <Link
          href="/auth/signin"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
};

export default ForgotPasswordForm;
