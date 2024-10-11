"use client";

import { navItems } from "@/frontend/constants/menuItems";
import logo from "@/app/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <div className="z-10 flex items-center justify-between h-16 px-4 bg-white sticky top-0">
      <div className="flex items-center cursor-pointer">
        <Image src={logo} alt="logo" width={30} height={30} priority />
        <Link
          href={"/"}
          className="ml-1 text-2xl uppercase whitespace-nowrap text-black font-bold"
        >
          Chill.me
        </Link>
      </div>
      <div className="flex h-full gap-2 items-center">
        {navItems.map((item, index) => (
          <Link
            href={item.path}
            key={index}
            className={`flex items-center gap-1 px-3 h-full transition duration-300 cursor-pointer text-black`}
          >
            <div>
              <item.icon size={20} className="object-cover" />
            </div>
            <div className="text-lx font-bold">{item.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
