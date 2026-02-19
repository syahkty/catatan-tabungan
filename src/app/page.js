import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home({ searchParams }) {
  // Di Next.js versi terbaru, searchParams harus di-await
  const params = await searchParams;
  const step = params?.step || '1';

  // =================================================================
  // SERVER ACTION: Menyimpan ke Database
  // =================================================================
  async function simpanTabungan(formData) {
    "use server";
    const nama = formData.get("nama");
    const nominal = parseInt(formData.get("nominal"));

    if (nama && nominal) {
      await prisma.tabungan.create({
        data: { nama, nominal },
      });
      // Setelah berhasil simpan, arahkan ke halaman animasi sukses (Step 4)
      redirect("/?step=4");
    }
  }

  // =================================================================
  // HALAMAN 1: DASHBOARD (Total & Riwayat)
  // =================================================================
  if (step === '1') {
    // Menghitung total gabungan
    const totalSemua = await prisma.tabungan.aggregate({ _sum: { nominal: true } });
    const total = totalSemua._sum.nominal || 0;

    // Menghitung total masing-masing orang secara otomatis
    const totalPerOrang = await prisma.tabungan.groupBy({
      by: ['nama'],
      _sum: { nominal: true },
    });

    // Mengambil 5 riwayat terakhir
    const riwayat = await prisma.tabungan.findMany({
      orderBy: { tanggal: "desc" },
      take: 5,
    });

    return (
      <main className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800 pb-24">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-center text-blue-600 mt-4">Tabungan Kita</h1>
          
          {/* Card Total Gabungan */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-6 text-center shadow-lg text-white">
            <p className="text-sm opacity-80 mb-1">Total Saldo Terkumpul</p>
            <p className="text-4xl font-bold">Rp {total.toLocaleString('id-ID')}</p>
          </div>

          {/* Card Rincian Masing-Masing */}
          <div className="grid grid-cols-2 gap-4">
            {totalPerOrang.map((item) => (
              <div key={item.nama} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">Saldo {item.nama}</p>
                <p className="text-lg font-bold text-gray-800">Rp {(item._sum.nominal || 0).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          {/* List Riwayat */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold mb-4 text-gray-700 pb-2">Riwayat Terakhir</h2>
            <ul className="space-y-3">
              {riwayat.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">{item.nama}</p>
                    <p className="text-xs text-gray-400">{item.tanggal.toLocaleDateString('id-ID')}</p>
                  </div>
                  <p className="font-bold text-sm text-green-600">+Rp {item.nominal.toLocaleString('id-ID')}</p>
                </li>
              ))}
              {riwayat.length === 0 && <p className="text-xs text-gray-500 italic text-center py-2">Belum ada transaksi.</p>}
            </ul>
          </div>
        </div>

        {/* Tombol Tabung Melayang di Bawah */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-gray-200">
          <div className="max-w-md mx-auto">
            <Link href="/?step=2" className="block w-full bg-blue-600 text-white text-center font-bold py-3.5 rounded-full shadow-lg hover:bg-blue-700 transition">
              + Tabung Sekarang
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =================================================================
  // HALAMAN 2: FORM INPUT
  // =================================================================
  if (step === '2') {
    return (
      <main className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto font-sans text-gray-800">
        <Link href="/" className="text-gray-500 font-bold mb-6">← Kembali</Link>
        <h1 className="text-2xl font-bold mb-6">Mau nabung berapa?</h1>
        
        {/* Form menggunakan method GET agar datanya pindah ke URL (Step 3) */}
        <form action="/" className="space-y-6 flex-1">
          <input type="hidden" name="step" value="3" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Nama</label>
            <select name="nama" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option value="">-- Pilih --</option>
              <option value="Syahkty">Syahkty</option>
              <option value="Prita">Prita</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nominal (Rp)</label>
            <input 
              type="number" 
              name="nominal" 
              required 
              placeholder="Contoh: 50000"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-lg font-bold"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition mt-8">
            Masukkan Uang
          </button>
        </form>
      </main>
    );
  }

  // =================================================================
  // HALAMAN 3: QRIS & KONFIRMASI
  // =================================================================
  if (step === '3') {
    const nama = params?.nama;
    const nominal = params?.nominal;

    return (
      <main className="min-h-screen bg-gray-50 flex flex-col p-6 max-w-md mx-auto font-sans text-gray-800 items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full text-center">
          <h2 className="text-lg font-bold text-gray-700 mb-1">Transfer Tabungan</h2>
          <p className="text-gray-500 text-sm mb-6">a.n {nama}</p>
          
          <p className="text-3xl font-bold text-blue-600 mb-6">
            Rp {parseInt(nominal).toLocaleString('id-ID')}
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 inline-block">
            {/* Pastikan file qris.png ada di folder public */}
            <img src="/qris.jpeg" alt="QRIS DANA" className="w-48 h-auto mx-auto rounded-lg" />
          </div>
          <p className="text-xs text-gray-400 mb-8">Scan menggunakan aplikasi DANA</p>

          {/* Form untuk mengeksekusi Server Action (simpan ke database) */}
          <form action={simpanTabungan}>
            <input type="hidden" name="nama" value={nama} />
            <input type="hidden" name="nominal" value={nominal} />
            <button type="submit" className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-600 transition">
              Saya Sudah Transfer
            </button>
          </form>
          
          <Link href="/?step=2" className="block mt-4 text-sm text-gray-400 font-medium">Batal</Link>
        </div>
      </main>
    );
  }

  // =================================================================
  // HALAMAN 4: ANIMASI SUKSES
  // =================================================================
  if (step === '4') {
    return (
      <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        {/* Meta tag ini akan otomatis mengembalikan user ke Beranda setelah 3 detik */}
        <meta httpEquiv="refresh" content="3;url=/" />
        
        {/* Animasi CSS bawaan Tailwind */}
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg animate-bounce">
          ✓
        </div>
        
        <h1 className="text-3xl font-bold text-green-700 mb-2">Berhasil!</h1>
        <p className="text-gray-600 mb-8">Uang tabungan berhasil dicatat ke sistem.</p>
        
        <p className="text-sm text-gray-400 animate-pulse">Mengembalikan ke beranda...</p>
      </main>
    );
  }
}