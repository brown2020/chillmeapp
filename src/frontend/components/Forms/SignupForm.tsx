"use client";

import { Button, Input } from "@chill-ui";
import { useForm } from "react-hook-form";
import clsx from "clsx";
import { useAuth } from "@/frontend/hooks";

type FormVals = {
  email: string;
  password: string;
};

const SignupForm = () => {
  const { createAccount } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>();

  const onSubmit = async (data: FormVals) => {
    await createAccount(data.email, data.password);
  };

  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-center">
          Create an account
        </h3>
        <p className="text-sm text-center text-zinc-600">
          Create your account real quick to start collaborating with your team
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            type="email"
            placeholder="Email"
            className={clsx("w-full")}
            {...register("email", { required: "Email is required" })}
            error={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          />

          <Input
            type="password"
            placeholder="Password"
            className={clsx("w-full")}
            {...register("password", { required: "Password is required" })}
            errorMessage={errors.password?.message}
            error={Boolean(errors.password)}
          />

          <Button disabled={isSubmitting} type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
