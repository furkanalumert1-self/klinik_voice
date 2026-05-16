import Link from "next/link";
import { db, appointments } from "@/lib/db";
import { gte, lte, eq, and, count } from "drizzle-orm";

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const todayEnd = new Date(now.setHours(23, 59, 59, 999));

  const [todayAppts, pendingCount, completedCount] = await Promise.all([
    db.select().from(appointments).where(
      and(gte(appointments.appointmentAt, todayStart), lte(appointments.appointmentAt, todayEnd))
    ),
    db.select({ count: count() }).from(appointments).where(eq(appointments.status, "talep")),
    db.select({ count: count() }).from(appointments).where(eq(appointments.status, "tamamlandi")),
  ]);

  const metrics = [
    { label: "Bugün", value: todayAppts.length, href: "/admin/appointments?view=today" },
    { label: "Bekleyen", value: pendingCount[0]?.count ?? 0, href: "/admin/appointments?status=talep" },
    { label: "Tamamlanan", value: completedCount[0]?.count ?? 0, href: "/admin/appointments?status=tamamlandi" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Link href="/randevu" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Yeni Randevu
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} className="bg-white border rounded-xl p-6 hover:shadow-md transition text-center">
            <p className="text-3xl font-bold text-blue-600">{m.value}</p>
            <p className="text-gray-500 text-sm mt-1">{m.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Bugünün Randevuları</h2>
        {todayAppts.length === 0 ? (
          <p className="text-gray-400 text-sm">Bugün randevu yok.</p>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((a) => (
              <Link key={a.id} href={`/admin/appointments/${a.id}`} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                <div>
                  <p className="font-medium text-sm">{a.patientName}</p>
                  <p className="text-xs text-gray-400">{a.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(a.appointmentAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === "onaylandi" ? "bg-green-100 text-green-700" :
                    a.status === "talep" ? "bg-yellow-100 text-yellow-700" :
                    a.status === "iptal" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{a.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Takvim", href: "/admin/appointments" },
          { label: "Çağrı Logları", href: "/admin/calls" },
          { label: "Doktorlar", href: "/admin/doctors" },
          { label: "Hizmetler", href: "/admin/services" },
        ].map((n) => (
          <Link key={n.href} href={n.href} className="bg-white border rounded-lg px-4 py-3 text-center text-sm hover:shadow transition">
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
