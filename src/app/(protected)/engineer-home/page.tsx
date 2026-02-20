"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import EngineerBottomBar from "@/app/(protected)/components/EngineerBottomBar";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const quickActions = [
  { label: "Rewards", iconSrc: "/assets/reward.svg" },
  { label: "Performance", iconSrc: "/assets/performance.svg" },
  { label: "Earnings", iconSrc: "/assets/wallet.svg" },
  { label: "Assets", iconSrc: "/assets/folder.svg" },
  { label: "QR codes", iconSrc: "/assets/qrcode.svg", preserveSvgColors: true },
  { label: "Skills", iconSrc: "/assets/skills.svg" },
];

export default function EngineerHomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "engineer") {
    return null;
  }

  async function toggleVideoPlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsPlaying(false);
  }

  return (
    <>
     {/* <div className="mx-auto w-full max-w-md space-y-4 pb-32"> */}
      <div className="bg-white p-4 pb-32">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-[#27549d]">
            Welcome <span className="text-[#17325e]">to Aspect!</span>
          </p>
          <div className="flex items-center gap-3 text-[#27549d]">
            <Bell className="h-5 w-5" />
            <User className="h-5 w-5" />
            <Settings className="h-5 w-5" />
          </div>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-[#3159a7] via-[#4068b2] to-[#89a4d7] p-6 text-white">
          <div className="absolute -right-10 top-2 h-32 w-32 rounded-full bg-white/15" />
          <div className="absolute -left-14 bottom-0 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between">
            <button className="rounded-full bg-white/30 p-1.5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-full bg-white/30 p-1.5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="relative z-10 mt-2 text-sm text-white/90">September 12-22</p>
          <p className="relative z-10 text-2xl font-semibold text-[#f1ff24]">New training available</p>
          <button className="relative z-10 mt-4 rounded-[10px] border border-[#f1ff24] px-6 py-2 font-semibold text-[#f1ff24]">
            Find out more
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {quickActions.map((item) => (
            <Card
              key={item.label}
              className="rounded-[8px] border-[0.5px] border-[#D8E6FF] bg-[linear-gradient(180deg,#FEFFEB_-34.33%,#FFF_100%)] p-3 text-center shadow-[0_2px_4px_0_rgba(50,56,67,0.04)]"
            >
              {item.preserveSvgColors ? (
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={20}
                  height={20}
                  className="mx-auto mb-2 h-5 w-5"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="mx-auto mb-2 block h-5 w-5 bg-primary"
                  style={{
                    maskImage: `url('${item.iconSrc}')`,
                    WebkitMaskImage: `url('${item.iconSrc}')`,
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                  }}
                />
              )}
              <p className="text-sm font-medium text-[#848EA3]">{item.label}</p>
            </Card>
          ))}
        </div>

        <Card className="mb-4 rounded-[12px] border border-[#d8e6ff] bg-white p-2 shadow-none">
          <div className="relative overflow-hidden rounded-[10px] md:hidden">
            <div className="relative w-full pt-[56.25%]">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src="/assets/video.mp4"
                muted
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <button
                type="button"
                aria-label={isPlaying ? "Pause video" : "Play video"}
                onClick={toggleVideoPlayback}
                className="absolute inset-0 z-10 flex items-center justify-center"
              >
                {!isPlaying && (
                  <span
                    aria-hidden="true"
                    className="h-[72px] w-[72px] bg-accent"
                    style={{
                      maskImage: "url('/assets/Play_circle.svg')",
                      WebkitMaskImage: "url('/assets/Play_circle.svg')",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                )}
              </button>
            </div>
          </div>
          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#5f7fc5] via-[#88a3d8] to-[#9eb3dc] md:flex">
            <span
              aria-hidden="true"
              className="h-[72px] w-[72px] bg-accent"
              style={{
                maskImage: "url('/assets/Play_circle.svg')",
                WebkitMaskImage: "url('/assets/Play_circle.svg')",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </div>
        </Card>

      </div>

      <EngineerBottomBar active="home" />
    {/* </div> */}
    </>
  );
}
