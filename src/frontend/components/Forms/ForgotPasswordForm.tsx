"use client";

import { Button, Input } from "@chill-ui";
import { useAuth } from "@frontend/hooks";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, Mail } from "lucide-react";

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
      <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
        <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold">
            Check your email
          </h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
          <Link
            href="/auth/signin"
            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-center">
          Forgot password?
        </h3>
        <p className="text-sm text-center text-muted-foreground">
          No worries, we&apos;ll send you reset instructions
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            type="email"
            placeholder="Enter your email"
            className={clsx("w-full")}
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

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? "Sending..." : "Reset password"}
          </Button>
        </form>

        <Link
          href="/auth/signin"
          className="text-sm text-center text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
