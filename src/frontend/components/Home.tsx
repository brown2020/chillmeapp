"use client";

import { Button } from "@chill-ui";
import Link from "next/link";
import { useAuth } from "@frontend/hooks";

export default function Home() {
  const { isLogged } = useAuth();

  return (
    <section className="bg-background text-foreground min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:items-center">
        <div className="mx-auto text-center">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
            Seamless Meetings.
            <span className="sm:block"> Collaborate Effortlessly. </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed text-muted-foreground">
            Say goodbye to complicated setups and hello to smooth, real-time
            communication. Empower your team with high-quality video meetings
            that make every conversation count.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isLogged ? (
              <Button asChild>
                <Link href="/live">Start Meeting</Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/signin">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
