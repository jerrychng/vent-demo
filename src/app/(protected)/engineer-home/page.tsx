"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EngineerBottomBar from "@/app/(protected)/components/EngineerBottomBar";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Circle,
  Phone,
  Mail,
  MapPin,
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
  const { user, logout } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createdByEmail, setCreatedByEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.created_by) {
      setCreatedByEmail(null);
      return;
    }
    apiFetch<{ email: string }>(`/users/${user.created_by}`)
      .then((creator) => setCreatedByEmail(creator.email))
      .catch(() => setCreatedByEmail(null));
  }, [user?.created_by]);

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

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (profileOpen) {
    return (
      <>
        <div className="bg-white p-4 pb-32">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-2xl font-semibold text-primary">
              Welcome <span className="text-dark-primary">to Aspect!</span>
            </p>
          </div>

          <div className="rounded-[12px] border border-subtle bg-[linear-gradient(180deg,var(--color-bg-bakground)_0%,white_100%)] p-5 shadow-[0_2px_8px_rgba(39,84,157,0.06)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-subtle bg-subtle">
                  <div className="flex h-full w-full items-center justify-center">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 bg-primary"
                      style={{
                        maskImage: "url('/assets/user_2.svg')",
                        WebkitMaskImage: "url('/assets/user_2.svg')",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        maskPosition: "center",
                        WebkitMaskPosition: "center",
                        maskSize: "contain",
                        WebkitMaskSize: "contain",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-dark-primary">{user.full_name}</p>
                  <p className="text-base text-text-dark-gray">Engineer</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold text-text-body">About</p>
              <span className="inline-flex items-center rounded-[8px] border border-secondary px-3 py-1 text-sm font-medium text-primary">
                <Circle className="mr-1 h-2 w-2 fill-current stroke-current" />
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-4 text-base text-text-body">
              <p className="inline-flex items-center gap-3">
                <Phone className="h-4 w-4 text-text-dark-gray" />
                <span className="font-medium">Phone:</span>
                <span>{user.phone_number?.trim() ? user.phone_number : "Not provided"}</span>
              </p>
              <p className="inline-flex items-center gap-3 break-all">
                <Mail className="h-4 w-4 text-text-dark-gray" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </p>
            </div>

            <hr className="my-5 border-subtle" />

            <div>
              <p className="mb-3 text-lg font-semibold text-text-body">Address</p>
              <p className="inline-flex items-start gap-2 text-base leading-6 text-text-body">
                <MapPin className="mt-1 h-4 w-4 text-text-dark-gray" />
                {user.address?.trim() ? user.address : "Address not provided"}
              </p>
            </div>

            <hr className="my-5 border-subtle" />

            <div>
              <p className="mb-3 text-lg font-semibold text-text-body">System information</p>
              <div className="space-y-2 text-base text-text-body">
                <p className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 bg-primary"
                    style={{
                      maskImage: "url('/assets/user_2.svg')",
                      WebkitMaskImage: "url('/assets/user_2.svg')",
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                  Created by: {createdByEmail ?? "-"}
                </p>
                <p>
                  Created on:
                  {" "}
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                </p>
                
              </div>
            </div>
          </div>

          <div className="mt-4 flex w-full justify-end">
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* <EngineerBottomBar active="home" /> */}
      </>
    );
  }

  return (
    <>
     {/* <div className="mx-auto w-full max-w-md space-y-4 pb-32"> */}
      <div className="bg-white p-4 pb-32">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-primary">
            Welcome <span className="text-dark-primary">to Aspect!</span>
          </p>
          <div className="flex items-center text-primary">
            <button
              type="button"
              aria-label="Open profile"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-subtle"
              onClick={() => setProfileOpen(true)}
            >
              <Image
                src="/assets/profile.svg"
                alt="Profile"
                width={26}
                height={26}
                className="h-[26px] w-[26px]"
              />
            </button>
          </div>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-dark-primary via-primary to-primary p-6 text-white">
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
          <p className="relative z-10 text-2xl font-semibold text-accent">New training available</p>
          <button className="relative z-10 mt-4 rounded-[10px] border border-accent px-6 py-2 font-semibold text-accent">
            Find out more
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          {quickActions.map((item) => (
            <Card
              key={item.label}
              className="rounded-[8px] border-[0.5px] border-subtle bg-[linear-gradient(180deg,rgba(241,255,36,0.18)_-34.33%,white_100%)] p-3 text-center shadow-[0_2px_4px_0_rgba(50,56,67,0.04)]"
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
              <p className="text-sm font-medium text-text-dark-gray">{item.label}</p>
            </Card>
          ))}
        </div>

        <Card className="mb-4 rounded-[12px] border border-subtle bg-white p-2 shadow-none">
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
          <div className="relative hidden h-48 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-secondary via-secondary to-subtle md:flex">
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

      {/* <EngineerBottomBar active="home" /> */}
    {/* </div> */}
    </>
  );
}


