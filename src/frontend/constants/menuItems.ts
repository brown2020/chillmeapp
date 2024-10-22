import {
  CircleUserIcon,
  VideoIcon,
  KeyRound,
  PresentationIcon,
} from "lucide-react";

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

export const authenticatedNavItems: navItemType[] = [
  {
    label: "Live",
    icon: VideoIcon,
    path: "/live",
  },
  {
    label: "Past Meetings",
    icon: PresentationIcon,
    path: "/past-meetings",
  },
  {
    label: "Profile",
    icon: CircleUserIcon,
    path: "/profile",
  },
  {
    label: "Signout",
    icon: KeyRound,
    path: "/auth/signout",
  },
];

export const guestNavItems: navItemType[] = [
  {
    label: "Signin",
    icon: KeyRound,
    path: "/auth/signin",
  },
  {
    label: "Create Account",
    icon: CircleUserIcon,
    path: "/auth/signup",
  },
];
