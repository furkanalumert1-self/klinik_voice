import { db, doctors } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function DoktorlarimizPage() {
  const docs = await db.select().from(doctors).where(eq(doctors.isActive, true)).orderBy(doctors.displayOrder);

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">Doktor Kadromuz</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docs.map((d) => (
            <div key={d.id} className="bg-white border rounded-xl p-6 flex gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 shrink-0">
                {d.fullName[0]}
              </div>
              <div>
                <p className="font-bold text-lg">{d.title} {d.fullName}</p>
                <p className="text-blue-600 text-sm mb-2">{d.specialty}</p>
                {d.bio && <p className="text-gray-500 text-sm">{d.bio}</p>}
                <Link href={`/randevu?doctorId=${d.id}`} className="mt-3 inline-block text-sm text-blue-600 hover:underline">
                  Randevu Al →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
