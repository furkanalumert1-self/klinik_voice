import { NextRequest } from "next/server";
import { db, appointments } from "@/lib/db";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { generateSlots } from "@/lib/utils/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const doctorId = searchParams.get("doctorId");

  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date(startDate.getTime() + 7 * 86400000);

  const conditions = [
    gte(appointments.appointmentAt, startDate),
    lte(appointments.appointmentAt, endDate),
    ne(appointments.status, "iptal"),
  ];
  if (doctorId) conditions.push(eq(appointments.doctorId, doctorId));

  const existing = await db.select().from(appointments).where(and(...conditions));

  const allSlots: string[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= endDate) {
    const daySlots = generateSlots(new Date(cursor), existing);
    allSlots.push(...daySlots);
    cursor.setDate(cursor.getDate() + 1);
  }

  return Response.json({ slots: allSlots });
}
