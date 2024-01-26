"use client";

import { PulseLoader } from "react-spinners";

export const LoadingDots = ({ invert, size, fullscreen }: { invert?: boolean; size?: string; fullscreen?: boolean }) => {
  return (
    <div className={`${fullscreen && "w-full h-full flex justify-center items-center"}`}>
      <PulseLoader
        color={invert ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"}
        loading={true}
        size={size === undefined ? "0.4rem" : size}
        speedMultiplier={0.8}
      />
    </div>
  );
};
