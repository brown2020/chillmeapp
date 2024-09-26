"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/menuItems";

import logo from "@/app/assets/logo.png";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="z-10 flex items-center justify-between h-16 px-4 bg-blue-800 sticky top-0">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage("refresh");
          } else {
            console.log("Not React Native WebView environment");
          }
          setTimeout(() => router.push("/"), 100);
        }}
      >
        <Image src={logo} alt="logo" width={30} height={30} priority />
        <div className="ml-1 text-2xl uppercase whitespace-nowrap text-white">
          Chill.me
        </div>
      </div>
      <div className="flex h-full gap-2 items-center">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 px-3 h-full transition duration-300 cursor-pointer text-white hover:opacity-100 ${
              pathname.slice(0, 5) === item.path.slice(0, 5) && pathname !== "/"
                ? "opacity-100 bg-white/30"
                : "opacity-50"
            }`}
            onClick={() => {
              setTimeout(() => router.push(item.path), 100);
            }}
          >
            <div className="h-9 aspect-square">
              <item.icon size={30} className="h-full w-full object-cover" />
            </div>
            <div className="text-lx font-bold">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
