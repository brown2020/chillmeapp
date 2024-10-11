import { CircleUserIcon, VideoIcon, KeyRound } from "lucide-react";

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "About",
    href: "/",
    show: "everyone",
    header: false,
    footer: true,
  },

  {
    label: "Terms",
    href: "/terms",
    show: "everyone",
    header: false,
    footer: true,
  },
  {
    label: "Privacy",
    href: "/privacy",
    show: "everyone",
    header: false,
    footer: true,
  },
];

type navItemType = {
  label: string;
  icon: React.ElementType;
  path: string;
};

export const navItems: navItemType[] = [
  {
    label: "Live",
    icon: VideoIcon,
    path: "/live",
  },

  {
    label: "Profile",
    icon: CircleUserIcon,
    path: "/profile",
  },
  {
    label: "Signin",
    icon: KeyRound,
    path: "/auth/signin",
  },
];
