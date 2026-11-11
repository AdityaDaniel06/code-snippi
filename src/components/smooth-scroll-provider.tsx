"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling for the marketing page only. App screens keep native
 * scrolling (Monaco, long lists, keyboard paging), and so does anyone who
 * asks the OS for reduced motion.
 */
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const smooth = pathname === "/";

  useEffect(() => {
    if (!smooth) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Automated browsers (tests, audits) get native scrolling so jumps land.
    if (navigator.webdriver) return;

    // lerp (frame-rate independent damping) instead of a fixed 1.15s duration:
    // the page follows the wheel closely instead of drifting long after input
    // stops, which is what made scrolling feel laggy.
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      autoRaf: false, // driven by the GSAP ticker below, one RAF loop total
      // Nested scrollers (demo result list, code panes) scroll themselves while
      // they can, then hand the wheel back to the page without a jolt.
      allowNestedScroll: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      // Restore GSAP's default so app-screen animations recover from hitches.
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [smooth]);

  return <>{children}</>;
}
