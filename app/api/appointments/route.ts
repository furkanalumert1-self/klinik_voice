import { NextRequest } from "next/server";
import { z } from "zod";
import { db, appointments, doctors, services } from "@/lib/db";
import { and, gte, lte, eq, ne } from "drizzle-orm";

const createSchema = z.object({
  patientName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  tcNo: z.string().optional(),
  doctorId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  appointmentAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240).default(30),
  source: z.enum(["web", "voice_agent", "whatsapp", "telefon", "yuzyuze"]),
  complaint: z.string().optional(),
  kvkkConsent: z.boolean().refine((v) => v === true, "KVKK onayı gerekli"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const start = new Date(data.appointmentAt);
  const end = new Date(start.getTime() + data.durationMinutes * 60 * 1000);

  // Çakışma kontrolü
  const conflicts = await db
    .select()
    .from(appointments)
    .where(
      and(
        data.doctorId ? eq(appointments.doctorId, data.doctorId) : undefined,
        ne(appointments.status, "iptal"),
        lte(appointments.appointmentAt, end),
        gte(appointments.appointmentAt, start)
      )
    );

  if (conflicts.length > 0) {
    return Response.json({ error: "Bu saat dolu, lütfen başka saat seçin." }, { status: 409 });
  }

  const [appointment] = await db.insert(appointments).values({
    patientName: data.patientName,
    phone: data.phone,
    email: data.email,
    tcNo: data.tcNo,
    doctorId: data.doctorId,
    serviceId: data.serviceId,
    appointmentAt: start,
    durationMinutes: data.durationMinutes,
    source: data.source,
    complaint: data.complaint,
    status: "talep",
  }).returning();

  // n8n onay maili webhook
  if (process.env.N8N_WEBHOOK_REMINDER) {
    fetch(process.env.N8N_WEBHOOK_REMINDER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "confirmation",
        appointmentId: appointment.id,
        email: data.email,
        phone: data.phone,
        patientName: data.patientName,
        appointmentAt: start,
        clinicName: process.env.NEXT_PUBLIC_CLINIC_NAME,
        clinicPhone: process.env.NEXT_PUBLIC_CLINIC_PHONE,
        clinicAddress: process.env.NEXT_PUBLIC_CLINIC_ADDRESS,
      }),
    }).catch(() => null);
  }

  return Response.json({ appointment }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const doctorId = searchParams.get("doctorId");
  const status = searchParams.get("status");

  const conditions = [];
  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    conditions.push(gte(appointments.appointmentAt, start));
    conditions.push(lte(appointments.appointmentAt, end));
  }
  if (doctorId) conditions.push(eq(appointments.doctorId, doctorId));
  if (status) conditions.push(eq(appointments.status, status as any));

  const rows = await db.query.appointments.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { doctorId: true, serviceId: true },
    orderBy: (t, { asc }) => [asc(t.appointmentAt)],
  });

  return Response.json({ appointments: rows });
}
