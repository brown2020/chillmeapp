"use client";

import { Button } from "@chill-ui";

export default function Home() {
  return (
    <section className="bg-gray-900 text-white">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex  lg:items-center h-[calc(5000px - 10px)]">
        <div className="mx-auto text-center">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            Seamless Meetings.
            <span className="sm:block"> Collaborate Effortlessly. </span>
          </h1>

          <p className="mx-auto mt-4  sm:text-xl/relaxed">
            Say goodbye to complicated setups and hello to smooth, real-time
            communication. Empower your team with AI-powered interactions that
            make every meeting count.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button>Start Now</Button>

            <Button>Login</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
