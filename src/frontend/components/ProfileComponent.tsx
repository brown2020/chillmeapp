"use client";

import { Card, CardHeader, CardContent, Separator, Button } from "@chill-ui";
import { useState } from "react";
import { ProfilePageTab, TabGroupItem } from "@/types/entities";
import SubscriptionTab from "./ProfileTabs/Subscription";
import ProfileTab from "./ProfileTabs/ProfileTab";

const tabs: TabGroupItem<ProfilePageTab>[] = [
  {
    label: "Profile",
    value: "profile",
  },
  {
    label: "Subscription",
    value: "subscription",
  },
];

export default function ProfileComponent() {
  const [activeTab, setActiveTab] = useState<ProfilePageTab>("subscription");

  return (
    <>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p>Manage your account settings and set e-mail preferences.</p>
        </CardHeader>
        <Separator className="mb-5" />
        <CardContent>
          <div className="grid grid-cols-12">
            <div className="col-span-2">
              <div className="flex flex-col gap-2 text-left">
                {tabs.map((t) => (
                  <Button
                    key={t.value}
                    variant={activeTab === t.value ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab(t.value)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="col-span-8 p-8">
              {activeTab === "subscription" ? (
                <SubscriptionTab />
              ) : (
                <ProfileTab />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
