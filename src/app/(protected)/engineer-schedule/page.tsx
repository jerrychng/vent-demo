"use client";

import EngineerBottomBar from "@/app/(protected)/components/EngineerBottomBar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Calendar, CircleDot, EllipsisVertical, MapPin, User, FileText, Compass } from "lucide-react";

const appointments = [
  {
    title: "Leak Detection Diving",
    ref: "SA-142345",
    assignee: "Aman Bisht",
    location: "Edison",
    date: "May 14, 2026",
  },
  {
    title: "LD Swimming Pools",
    ref: "SA-142345",
    assignee: "John doe",
    location: "London",
    date: "May 14, 2026",
  },
  {
    title: "LD Dom - Mains Water",
    ref: "SA-142345",
    assignee: "Weaderson",
    location: "Kingston",
    date: "May 14, 2026",
  },
];

export default function EngineerSchedulePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "engineer") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "engineer") {
    return null;
  }

  return (
    <div className="pb-32">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3159a7] via-[#4068b2] to-[#89a4d7] pt-8 px-4 pb-4 text-white">
        <div className="absolute right-0 top-3 h-20 w-20 rounded-full bg-white/15" />
        <div className="relative z-10 flex rounded-full border border-white/35 bg-white/10 p-1">
          <button className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-[#17325e]">Upcoming</button>
          <button className="flex-1 py-2 text-sm font-semibold text-white/90">Ongoing</button>
          <button className="flex-1 py-2 text-sm font-semibold text-white/90">Completed</button>
        </div>
      </div>

      <div className="rounded-b-[10px] border border-[#d8e6ff] border-t-0 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#8b94aa]">
          <CircleDot className="h-4 w-4" />
          3 Upcoming Service Appointments
        </p>

        <div className="space-y-3">
          {appointments.map((item) => (
            <div key={`${item.title}-${item.location}`} className="rounded-[10px] border border-[#d8e6ff] bg-white p-3 shadow-[0_2px_4px_rgba(50,56,67,0.04)]">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-xl font-semibold text-[#2a4f97]">{item.title}</p>
                </div>
                <div className="rounded-full border border-[#9eb3dc] px-3 py-1 text-sm text-[#6d7690]">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-[#27549d]" />
                    {item.date}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-[#68728c]">
                  <p className="inline-flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-[#27549d]" />
                    {item.ref}
                  </p>
                  <p className="inline-flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-[#27549d]" />
                    {item.assignee}
                  </p>
                  <p className="inline-flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-[#27549d]" />
                    {item.location}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1 rounded-[10px] border border-[#3059a7] px-3 py-2 text-base font-semibold text-[#3059a7]">
                    <Compass className="h-4 w-4" />
                    Directions
                  </button>
                  <button className="text-[#9ca5bb]">
                    <EllipsisVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EngineerBottomBar active="schedule" />
    </div>
  );
}
