"use client";

import Link from "next/link";
import useProfileStore from "@/zustand/useProfileStore";
import { useEffect, useState } from "react";

export default function ProfileComponent() {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  // State for API keys
  const [liveAppAccessKey, setLiveAppAccessKey] = useState(
    profile.live_app_access_key
  );
  const [liveAppSecret, setLiveAppSecret] = useState(profile.live_app_secret);
  const [useCredits, setUseCredits] = useState(profile.useCredits);

  useEffect(() => {
    // Synchronize state with the profile
    setLiveAppAccessKey(profile.live_app_access_key);
    setLiveAppSecret(profile.live_app_secret);
  }, [profile.live_app_access_key, profile.live_app_secret]);

  const handleApiKeyChange = async () => {
    if (
      liveAppAccessKey !== profile.live_app_access_key ||
      liveAppSecret !== profile.live_app_secret
    ) {
      try {
        await updateProfile({
          live_app_access_key: liveAppAccessKey,
          live_app_secret: liveAppSecret,
        });
        console.log("API keys updated successfully!");
      } catch (error) {
        console.error("Error updating API keys:", error);
      }
    }
  };

  const handleCreditsChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const useCreditsValue = e.target.value === "credits";
    setUseCredits(useCreditsValue);
    await updateProfile({ useCredits: useCreditsValue });
  };

  const areApiKeysAvailable = liveAppAccessKey && liveAppSecret;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <div className="flex gap-2 w-full items-center">
          <div className="flex-1">
            Usage Credits: {Math.round(profile.credits)}
          </div>
          <Link
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 flex-1 text-center"
            href={"/payment-attempt"}
          >
            Buy 10,000 Credits
          </Link>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          You can either buy credits or add your own API keys for accessing the
          app.
        </div>
      </div>

      <div className="flex flex-col px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="live-app-access-key" className="text-sm font-medium">
          100ms Live App Access Key:
        </label>
        <input
          type="text"
          id="live-app-access-key"
          value={liveAppAccessKey}
          onChange={(e) => setLiveAppAccessKey(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10 text-black"
          placeholder="Enter your 100ms Live App Access Key"
        />
        <label htmlFor="live-app-secret" className="text-sm font-medium">
          100ms Live App Secret:
        </label>
        <input
          type="text"
          id="live-app-secret"
          value={liveAppSecret}
          onChange={(e) => setLiveAppSecret(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 h-10 text-black"
          placeholder="Enter your 100ms Live App Secret"
        />
        <button
          onClick={handleApiKeyChange}
          disabled={
            liveAppAccessKey === profile.live_app_access_key &&
            liveAppSecret === profile.live_app_secret
          }
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:opacity-50 disabled:opacity-50"
        >
          Update API Keys
        </button>
      </div>

      <div className="flex items-center px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <label htmlFor="toggle-use-credits" className="text-sm font-medium">
          Use:
        </label>
        <select
          id="toggle-use-credits"
          value={useCredits ? "credits" : "apikeys"}
          onChange={handleCreditsChange}
          className="border border-gray-300 rounded-md px-3 py-2 h-10 text-black disabled:bg-gray-300 disabled:opacity-50"
          disabled={!areApiKeysAvailable}
        >
          <option value="credits">Credits</option>
          {areApiKeysAvailable && <option value="apikeys">API Keys</option>}
        </select>
      </div>
    </div>
  );
}
