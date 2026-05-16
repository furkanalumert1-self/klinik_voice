import { NextRequest } from "next/server";
import { z } from "zod";
import { db, appointments } from "@/lib/db";
import { eq } from "drizzle-orm";

const patchSchema = z.object({
  status: z.enum(["talep", "onaylandi", "tamamlandi", "iptal", "gelmedi"]).optional(),
  appointmentAt: z.string().datetime().optional(),
  internalNotes: z.string().optional(),
  cancelReason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const metadata: Record<string, unknown> = {};
  if (data.cancelReason) metadata.cancelReason = data.cancelReason;

  const [updated] = await db
    .update(appointments)
    .set({
      ...(data.status && { status: data.status }),
      ...(data.appointmentAt && { appointmentAt: new Date(data.appointmentAt) }),
      ...(data.internalNotes && { internalNotes: data.internalNotes }),
      ...(Object.keys(metadata).length > 0 && { metadata }),
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, params.id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Randevu bulunamadı" }, { status: 404 });
  }

  return Response.json({ appointment: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const [updated] = await db
    .update(appointments)
    .set({ status: "iptal", updatedAt: new Date() })
    .where(eq(appointments.id, params.id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Randevu bulunamadı" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const appointment = await db.query.appointments.findFirst({
    where: (t, { eq }) => eq(t.id, params.id),
  });

  if (!appointment) {
    return Response.json({ error: "Randevu bulunamadı" }, { status: 404 });
  }

  return Response.json({ appointment });
}
