import { TabGroupItem } from "@/types/entities";
import { twMerge } from "tailwind-merge";
import React from "react";

type Props = {
  stateHandler: [string, React.Dispatch<React.SetStateAction<string>>];
  tabs: TabGroupItem[];
};

const TabGroup = ({ stateHandler, tabs }: Props) => {
  const activeClasses = "bg-white shadow-sm";
  const [activeTab, setActiveTab] = stateHandler;

  return (
    <div className="inline-flex rounded-md border border-gray-700 p-1 w-full">
      {tabs.map((t) => (
        <button
          className={twMerge(
            "inline-block rounded-md px-2 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative w-1/2",
            activeTab === t.value ? activeClasses : "",
          )}
          key={t.value}
          onClick={() => setActiveTab(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default TabGroup;
