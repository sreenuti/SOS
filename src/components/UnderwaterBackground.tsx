"use client";

import Image from "next/image";

/**
 * Dolphin background image. Fixed, full-viewport, with subtle opacity
 * so dashboard content stays readable.
 */
export default function UnderwaterBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 min-h-screen min-w-full"
      aria-hidden
    >
      <Image
        src="/images/dolphin_background.png"
        alt=""
        fill
        className="object-cover opacity-30"
        sizes="100vw"
        priority
      />
    </div>
  );
}
