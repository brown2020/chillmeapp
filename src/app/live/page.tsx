import { connection } from "next/server";
import Image from "next/image";
import CreateMeetingForm from "@/frontend/components/Forms/CreateMeetingForm";
import BannerImgOne from "@frontend/assets/banner.png";
import { isLiveKitEgressEnabled } from "@/utils/egress-config";

export default async function LiveMain() {
  await connection();
  const recordingAvailable = isLiveKitEgressEnabled();

  return (
    <div className="flex flex-col items-center mx-auto mt-8 w-full max-w-6xl px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
        <div className="col-span-12 md:col-span-5 flex flex-col items-center">
          <CreateMeetingForm recordingAvailable={recordingAvailable} />
        </div>
        <div className="col-span-12 md:col-span-7 flex flex-col items-center justify-center">
          <Image
            src={BannerImgOne}
            alt="meeting-image"
            className="w-full max-w-md rounded-lg"
          />
          <h1 className="text-xl font-bold mt-4 text-center">
            Start a meeting real quick
          </h1>
        </div>
      </div>
    </div>
  );
}
