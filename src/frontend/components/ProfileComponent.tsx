"use client";

import Link from "next/link";

export default function ProfileComponent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row px-5 py-3 gap-3 border border-gray-500 rounded-md">
        <div className="flex gap-2 w-full items-center">
          <div className="flex-1">Usage Credits: 10000</div>
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
    </div>
  );
}
