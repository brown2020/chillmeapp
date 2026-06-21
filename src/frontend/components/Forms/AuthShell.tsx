import Image from "next/image";
import type { ReactNode } from "react";
import banner from "@/frontend/assets/banner.png";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <section className="flex min-h-[calc(100vh-6rem)] w-full items-center justify-center px-2 py-8 sm:px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center gap-8 p-6 sm:p-10 lg:p-12">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
        </div>

        <div className="hidden border-l border-border bg-secondary/35 p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Chill.me
            </p>
            <h2 className="text-2xl font-semibold leading-tight">
              Start the room, share the link, keep the conversation moving.
            </h2>
          </div>
          <Image
            src={banner}
            alt="People collaborating around a meeting table"
            className="mt-8 h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
