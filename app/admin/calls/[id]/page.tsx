import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function CallDetailPage({ params }: { params: { id: string } }) {
  const call = await db.query.voiceCalls.findFirst({
    where: (t, { eq }) => eq(t.id, params.id),
  });

  if (!call) notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Çağrı Detayı</h1>
        <Link href="/admin/calls" className="text-sm text-gray-500 hover:underline">← Geri</Link>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-3 mb-6">
        {[
          { label: "Telefon", value: call.phone },
          { label: "Yön", value: call.direction },
          { label: "Süre", value: call.durationSeconds ? `${call.durationSeconds} saniye` : "-" },
          { label: "Sonuç", value: call.outcome ?? "-" },
          { label: "Randevu", value: call.appointmentId ?? "-" },
          { label: "Tarih", value: new Date(call.createdAt).toLocaleString("tr-TR") },
        ].map((f) => (
          <div key={f.label} className="flex gap-4 text-sm">
            <span className="w-28 text-gray-400 shrink-0">{f.label}</span>
            <span className="font-medium">{f.value}</span>
          </div>
        ))}
      </div>

      {call.summary && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold mb-3">Özet</h2>
          <p className="text-sm text-gray-700">{call.summary}</p>
        </div>
      )}

      {call.transcript && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Transkript</h2>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">{call.transcript}</pre>
        </div>
      )}
    </div>
  );
}
