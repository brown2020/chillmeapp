"use client";

import AuthComponent from "@/frontend/components/AuthComponent";

export default function Home() {
  return (
    <div className="flex flex-col h-full w-full justify-center items-center text-white">
      <div className="flex flex-col z-10 gap-5 px-4 py-4 md:px-9 md:py-9 text-center max-w-4xl bg-black/60 rounded-lg">
        <h2 className="text-3xl md:text-5xl font-semibold">
          Welcome to Chill.me
        </h2>

        <h2 className="text-xl md:text-2xl md:px-9">
          Sign in to use this video chat demo.
        </h2>

        <AuthComponent />
      </div>
    </div>
  );
}
