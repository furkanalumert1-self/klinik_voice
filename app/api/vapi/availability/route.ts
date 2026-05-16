import { NextRequest } from "next/server";
import { db, appointments } from "@/lib/db";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { verifyVapiSignature } from "@/lib/utils/vapi";
import { generateSlots } from "@/lib/utils/slots";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-vapi-signature");

  if (!verifyVapiSignature(rawBody, sig)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const { name, parameters } = body.functionCall ?? {};

  if (name !== "check_availability") {
    return Response.json({ error: "Unknown function" }, { status: 400 });
  }

  const { doctorId, startDate, endDate } = parameters ?? {};
  const start = new Date(startDate ?? new Date());
  const end = new Date(endDate ?? new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000));

  const conditions = [
    gte(appointments.appointmentAt, start),
    lte(appointments.appointmentAt, end),
    ne(appointments.status, "iptal"),
  ];
  if (doctorId) conditions.push(eq(appointments.doctorId, doctorId));

  const existing = await db.select().from(appointments).where(and(...conditions));

  const results: { doctorId: string | null; slots: string[] }[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const daySlots = generateSlots(cursor, existing);
    if (daySlots.length > 0) {
      results.push({ doctorId: doctorId ?? null, slots: daySlots.slice(0, 10) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return Response.json({ result: results });
}
