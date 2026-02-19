import { prisma } from "../../lib/prisma";
import Link from "next/link";

// Memaksa Next.js untuk selalu mengambil data terbaru dari database (tidak di-cache)
export const dynamic = "force-dynamic";

export default async function Riwayat() {
  // Mengambil SEMUA data tabungan dari yang paling baru hingga paling lama
  const semuaRiwayat = await prisma.tabungan.findMany({
    orderBy: { tanggal: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800 pb-10">
      <div className="max-w-md mx-auto space-y-6 mt-4">
        
        {/* Header dengan Tombol Kembali */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-blue-600 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition">
            ← Kembali
          </Link>
          <h1 className="text-xl font-bold text-gray-700">Semua Transaksi</h1>
        </div>
        
        {/* Daftar Seluruh Riwayat */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <ul className="space-y-4">
            {semuaRiwayat.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-md">{item.nama}</p>
                  <p className="text-xs text-gray-500">
                    {/* Format tanggal yang lebih detail dengan jam */}
                    {item.tanggal.toLocaleDateString('id-ID', {
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className="font-bold text-md text-green-600">+Rp {item.nominal.toLocaleString('id-ID')}</p>
              </li>
            ))}
            
            {semuaRiwayat.length === 0 && (
              <p className="text-sm text-gray-500 italic text-center py-4">Belum ada transaksi.</p>
            )}
          </ul>
        </div>
        
      </div>
    </main>
  );
}