import { db, services } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function HizmetlerPage() {
  const svcs = await db.select().from(services).where(eq(services.isActive, true));

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Hizmetlerimiz</h1>
        <p className="text-center text-gray-500 mb-12">Fiyatlar muayene sonrası kesinleşir.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {svcs.map((s) => (
            <div key={s.id} className="bg-white border rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  {s.description && <p className="text-gray-500 text-sm mt-1">{s.description}</p>}
                  <p className="text-gray-400 text-xs mt-1">{s.durationMinutes} dakika</p>
                </div>
                {s.priceFrom && (
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-blue-600 font-semibold text-sm">
                      {s.priceFrom.toLocaleString("tr-TR")}
                      {s.priceTo ? ` – ${s.priceTo.toLocaleString("tr-TR")}` : "+"} ₺
                    </p>
                  </div>
                )}
              </div>
              <Link href={`/randevu?serviceId=${s.id}`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                Randevu Al →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
