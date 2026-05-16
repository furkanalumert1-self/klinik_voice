import Link from "next/link";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const appt = await db.query.appointments.findFirst({
    where: (t, { eq }) => eq(t.id, params.id),
  });

  if (!appt) notFound();

  const fields = [
    { label: "Hasta Adı", value: appt.patientName },
    { label: "Telefon", value: appt.phone },
    { label: "E-posta", value: appt.email ?? "-" },
    { label: "Durum", value: appt.status },
    { label: "Kaynak", value: appt.source },
    { label: "Randevu Saati", value: new Date(appt.appointmentAt).toLocaleString("tr-TR") },
    { label: "Süre", value: `${appt.durationMinutes} dk` },
    { label: "Şikayet", value: appt.complaint ?? "-" },
    { label: "Notlar", value: appt.internalNotes ?? "-" },
    { label: "Oluşturulma", value: new Date(appt.createdAt).toLocaleString("tr-TR") },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Randevu Detayı</h1>
        <Link href="/admin/appointments" className="text-sm text-gray-500 hover:underline">← Geri</Link>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-3">
        {fields.map((f) => (
          <div key={f.label} className="flex gap-4 text-sm">
            <span className="w-36 text-gray-400 shrink-0">{f.label}</span>
            <span className="font-medium">{f.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3 flex-wrap">
        <form action={`/api/appointments/${params.id}`} method="PATCH">
          <button
            type="button"
            onClick={async () => {
              await fetch(`/api/appointments/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "onaylandi" }),
              });
              window.location.reload();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            Onayla
          </button>
        </form>
        <button
          onClick={async () => {
            const reason = prompt("İptal sebebi:");
            if (!reason) return;
            await fetch(`/api/appointments/${params.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "iptal", cancelReason: reason }),
            });
            window.location.reload();
          }}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200"
        >
          İptal Et
        </button>
        <button
          onClick={async () => {
            await fetch(`/api/appointments/${params.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "tamamlandi" }),
            });
            window.location.reload();
          }}
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200"
        >
          Tamamlandı
        </button>
      </div>
    </div>
  );
}
