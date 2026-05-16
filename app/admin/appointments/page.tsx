import Link from "next/link";
import { db, appointments } from "@/lib/db";
import { gte, lte, and, eq } from "drizzle-orm";

const STATUS_COLORS: Record<string, string> = {
  onaylandi: "bg-green-100 text-green-700",
  talep: "bg-yellow-100 text-yellow-700",
  iptal: "bg-red-100 text-red-700",
  tamamlandi: "bg-blue-100 text-blue-700",
  gelmedi: "bg-gray-100 text-gray-600",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: { view?: string; status?: string; date?: string };
}) {
  const now = new Date();
  let rangeStart: Date;
  let rangeEnd: Date;

  const view = searchParams.view ?? "today";
  if (view === "week") {
    rangeStart = new Date(now.setHours(0, 0, 0, 0));
    rangeEnd = new Date(rangeStart.getTime() + 7 * 86400000);
  } else if (view === "month") {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else {
    rangeStart = new Date(new Date().setHours(0, 0, 0, 0));
    rangeEnd = new Date(new Date().setHours(23, 59, 59, 999));
  }

  const conditions = [
    gte(appointments.appointmentAt, rangeStart),
    lte(appointments.appointmentAt, rangeEnd),
  ];
  if (searchParams.status) {
    conditions.push(eq(appointments.status, searchParams.status as any));
  }

  const rows = await db.select().from(appointments).where(and(...conditions))
    .orderBy(appointments.appointmentAt);

  const views = [
    { key: "today", label: "Bugün" },
    { key: "week", label: "Bu Hafta" },
    { key: "month", label: "Bu Ay" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Randevular</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">← Dashboard</Link>
      </div>

      <div className="flex gap-2 mb-6">
        {views.map((v) => (
          <Link
            key={v.key}
            href={`?view=${v.key}`}
            className={`px-4 py-2 rounded-lg text-sm transition ${view === v.key ? "bg-blue-600 text-white" : "bg-white border hover:shadow"}`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Bu dönemde randevu yok.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Hasta</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tarih/Saat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Kaynak</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Durum</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.patientName}</p>
                    <p className="text-xs text-gray-400">{a.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(a.appointmentAt).toLocaleString("tr-TR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.source}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[a.status] ?? "bg-gray-100"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/appointments/${a.id}`} className="text-blue-600 hover:underline text-xs">
                      Detay
                    </Link>
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
