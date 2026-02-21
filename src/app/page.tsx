"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/login");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#27549d]">
      <div className="md:hidden">
        <Image
          src="/assets/Splash.png"
          alt="Aspect splash screen"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div
        className="relative hidden min-h-screen md:flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/background.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#17325e]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_45%)]" />
        <Image
          src="/assets/VanAspect.png"
          alt="Aspect van"
          width={980}
          height={480}
          priority
          className="absolute bottom-16 left-1/2 w-[42vw] max-w-[620px] min-w-[420px] -translate-x-1/2 object-contain"
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Image
            src="/assets/aspect-logo-primary.svg"
            alt="Aspect Maintenance Services"
            width={360}
            height={70}
            priority
            className="w-[300px] lg:w-[360px]"
          />
        </div>
      </div>
    </main>
  );
}
