import Link from "next/link";
import { db, voiceCalls } from "@/lib/db";
import { desc } from "drizzle-orm";

const OUTCOME_LABELS: Record<string, string> = {
  randevu_alindi: "Randevu Alındı",
  bilgi_verildi: "Bilgi Verildi",
  insan_aktarimi: "İnsan Aktarımı",
  cevapsiz: "Cevapsız",
  spam: "Spam",
  hata: "Hata",
};

export default async function CallsPage() {
  const calls = await db.select().from(voiceCalls).orderBy(desc(voiceCalls.createdAt)).limit(50);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Çağrı Logları</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">← Dashboard</Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        {calls.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Henüz çağrı kaydı yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Telefon</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Yön</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Süre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Sonuç</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tarih</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {calls.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{c.direction}</td>
                  <td className="px-4 py-3">{c.durationSeconds ? `${c.durationSeconds}s` : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${c.outcome === "randevu_alindi" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {c.outcome ? OUTCOME_LABELS[c.outcome] : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.createdAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/calls/${c.id}`} className="text-blue-600 hover:underline text-xs">Detay</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
