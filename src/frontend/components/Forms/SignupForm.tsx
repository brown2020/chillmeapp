"use client";

import { Button, Input } from "@chill-ui";

const SignupForm = () => {
  return (
    <div className="flex h-[80vh] w-full justify-center items-center p-4 sm:p-8">
      <div className="flex flex-col gap-6 w-full max-w-md border border-zinc-700 rounded-lg p-8 sm:p-10">
        <h3 className="text-2xl sm:text-3xl font-semibold text-center">
          Create an account
        </h3>
        <p className="text-sm text-center text-zinc-600">
          Create your account real quick to start collaborating with your team
        </p>

        <Input type="email" placeholder="Email" className="w-full" />
        <Input type="password" placeholder="Password" className="w-full" />

        <Button className="w-full">Create Account</Button>
      </div>
    </div>
  );
};

export default SignupForm;
