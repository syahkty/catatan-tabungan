"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function TombolNavigasi({ href, teks, className }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e) => {
    e.preventDefault(); // Mencegah loading standar browser
    startTransition(() => {
      router.push(href); // Pindah halaman di background
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${className} ${
        isPending ? "opacity-60 cursor-wait pointer-events-none animate-pulse" : "cursor-pointer"
      }`}
    >
      {isPending ? "⏳ Tunggu..." : teks}
    </a>
  );
}