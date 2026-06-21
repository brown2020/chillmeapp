"use client";

import {
  guestNavItems,
  authenticatedNavItems,
} from "@/frontend/constants/menuItems";
import { useAuth } from "../hooks";
import logo from "@/frontend/assets/logo.png";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Navbar() {
  const { isLogged } = useAuth();
  const pathname = usePathname();

  const navItems = isLogged ? authenticatedNavItems : guestNavItems;
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-4">
        <div className="flex items-center">
          <Image src={logo} alt="Chill.me" width={34} height={34} priority />
          <Link
            href={"/"}
            className="ml-2 whitespace-nowrap text-xl font-bold uppercase text-foreground"
          >
            Chill.me
          </Link>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/" && pathname.startsWith(`${item.path}/`));

            return (
              <Link
                href={item.path}
                key={item.path}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3",
                  isActive && "bg-accent text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sr-only sm:hidden">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
