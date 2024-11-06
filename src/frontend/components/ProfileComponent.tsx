"use client";

import { useAuth } from "@frontend/hooks";

export default function ProfileComponent() {
  const auth = useAuth();

  return (
    <div>
      <p>Name : {auth.user?.displayName || "Not Available"}</p>
      <p>Email : {auth.user?.email || ""}</p>
      <p> ID : {auth.user?.uid}</p>
    </div>
  );
}
