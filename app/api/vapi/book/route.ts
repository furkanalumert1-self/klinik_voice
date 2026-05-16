import { NextRequest } from "next/server";
import { db, appointments } from "@/lib/db";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { verifyVapiSignature } from "@/lib/utils/vapi";
import { formatTurkishDate } from "@/lib/utils/slots";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-vapi-signature");

  if (!verifyVapiSignature(rawBody, sig)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const { name, parameters } = body.functionCall ?? {};

  if (name !== "book_appointment") {
    return Response.json({ error: "Unknown function" }, { status: 400 });
  }

  const { patientName, phone, doctorId, serviceId, startAt, complaint } = parameters ?? {};

  if (!patientName || !phone || !startAt) {
    return Response.json({ result: { error: "patientName, phone ve startAt zorunlu" } });
  }

  const start = new Date(startAt);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const conflicts = await db.select().from(appointments).where(
    and(
      doctorId ? eq(appointments.doctorId, doctorId) : undefined,
      ne(appointments.status, "iptal"),
      lte(appointments.appointmentAt, end),
      gte(appointments.appointmentAt, start),
    )
  );

  if (conflicts.length > 0) {
    return Response.json({
      result: { error: "Bu saat dolu. Lütfen başka bir saat deneyin." }
    });
  }

  const [appointment] = await db.insert(appointments).values({
    patientName,
    phone,
    doctorId: doctorId ?? null,
    serviceId: serviceId ?? null,
    appointmentAt: start,
    durationMinutes: 30,
    source: "voice_agent",
    complaint: complaint ?? null,
    status: "talep",
  }).returning();

  // n8n confirmation
  if (process.env.N8N_WEBHOOK_REMINDER) {
    fetch(process.env.N8N_WEBHOOK_REMINDER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "confirmation", appointmentId: appointment.id, phone, patientName, appointmentAt: start }),
    }).catch(() => null);
  }

  return Response.json({
    result: {
      appointmentId: appointment.id,
      confirmationMessage: `Randevunuz alındı. ${formatTurkishDate(start)} tarihinde sizi bekliyoruz. İyi günler!`,
    }
  });
}
