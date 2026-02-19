"use client"; // Ini wajib agar bisa mengubah UI di sisi pengguna secara real-time

import { useFormStatus } from "react-dom";

export default function TombolSubmit({ teks, warnaBase = "bg-green-500" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full text-white font-bold py-4 rounded-xl shadow-md transition ${
        pending ? "bg-gray-400 cursor-not-allowed animate-pulse" : `${warnaBase} hover:opacity-90`
      }`}
    >
      {pending ? "⏳ Memproses..." : teks}
    </button>
  );
}