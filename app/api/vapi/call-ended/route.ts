import { NextRequest } from "next/server";
import { db, voiceCalls } from "@/lib/db";
import { verifyVapiSignature } from "@/lib/utils/vapi";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-vapi-signature");

  if (!verifyVapiSignature(rawBody, sig)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const call = body.call ?? body;

  const phone = call.customer?.number ?? call.phoneNumber ?? "";
  const externalCallId = call.id ?? null;
  const direction = call.type === "outboundPhoneCall" ? "outbound" : "inbound";
  const durationSeconds = call.endedAt && call.startedAt
    ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
    : null;
  const transcript = call.transcript ?? null;
  const summary = call.summary ?? null;
  const recordingUrl = call.recordingUrl ?? null;

  // appointmentId'yi tool call'lardan parse et
  let appointmentId: string | null = null;
  const toolCalls: any[] = call.toolCallResults ?? [];
  for (const tc of toolCalls) {
    if (tc.result?.appointmentId) {
      appointmentId = tc.result.appointmentId;
      break;
    }
  }

  let outcome: string = "bilgi_verildi";
  if (appointmentId) outcome = "randevu_alindi";
  else if (call.endedReason === "transfer") outcome = "insan_aktarimi";
  else if (call.endedReason === "no-answer") outcome = "cevapsiz";

  await db.insert(voiceCalls).values({
    externalCallId,
    phone,
    direction,
    durationSeconds,
    transcript,
    summary,
    outcome: outcome as any,
    appointmentId,
    recordingUrl,
  }).onConflictDoNothing();

  return Response.json({ ok: true });
}
