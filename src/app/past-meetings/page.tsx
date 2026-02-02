"use client";

import PastMeetings from "@/frontend/components/PastMeetings";

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Past Meetings</h1>
      <PastMeetings />
    </div>
  );
}
