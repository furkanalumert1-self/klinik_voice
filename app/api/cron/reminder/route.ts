import { NextRequest } from "next/server";
import { db, appointments, doctors, services } from "@/lib/db";
import { and, gte, lte, isNull, eq } from "drizzle-orm";

function authOk(req: NextRequest) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!authOk(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = new URL(req.url).searchParams.get("type") ?? "24h";
  const now = new Date();

  let windowStart: Date;
  let windowEnd: Date;
  let reminderField: "reminderSentAt" | "secondReminderSentAt";

  if (type === "2h") {
    windowStart = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    reminderField = "secondReminderSentAt";
  } else {
    windowStart = new Date(now.getTime() + 22 * 60 * 60 * 1000);
    windowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);
    reminderField = "reminderSentAt";
  }

  const rows = await db.query.appointments.findMany({
    where: and(
      gte(appointments.appointmentAt, windowStart),
      lte(appointments.appointmentAt, windowEnd),
      isNull(appointments[reminderField]),
      eq(appointments.status, "onaylandi"),
    ),
  });

  let sent = 0;
  for (const appt of rows) {
    if (!process.env.N8N_WEBHOOK_REMINDER) continue;

    const doc = appt.doctorId
      ? await db.query.doctors.findFirst({ where: (t, { eq }) => eq(t.id, appt.doctorId!) })
      : null;
    const svc = appt.serviceId
      ? await db.query.services.findFirst({ where: (t, { eq }) => eq(t.id, appt.serviceId!) })
      : null;

    await fetch(process.env.N8N_WEBHOOK_REMINDER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: type === "2h" ? "reminder_2h" : "reminder_24h",
        email: appt.email,
        phone: appt.phone,
        patientName: appt.patientName,
        appointmentAt: appt.appointmentAt,
        doctorName: doc?.fullName ?? "Doktorunuz",
        service: svc?.name ?? "Randevunuz",
        clinicName: process.env.NEXT_PUBLIC_CLINIC_NAME,
        clinicPhone: process.env.NEXT_PUBLIC_CLINIC_PHONE,
        clinicAddress: process.env.NEXT_PUBLIC_CLINIC_ADDRESS,
      }),
    }).catch(() => null);

    await db.update(appointments)
      .set({ [reminderField]: now, updatedAt: now })
      .where(eq(appointments.id, appt.id));

    sent++;
  }

  return Response.json({ ok: true, type, sent });
}
