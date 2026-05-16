import Anthropic from "@anthropic-ai/sdk";
import { db, doctors, services } from "@/lib/db";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic();

const TRIAGE_PROMPT = `
Sen klinik triyaj asistanısın. Hastanın şikayetini analiz et, uygun doktor+hizmet öner.

Doktorlar: {{doctors}}
Hizmetler: {{services}}

Çıktı JSON:
{
  "suggestedDoctorId": "uuid veya null",
  "suggestedServiceId": "uuid veya null",
  "urgency": "düşük|orta|yüksek",
  "estimatedDuration": 30,
  "reasoning": "kısa açıklama"
}

Kurallar:
- "kanama", "şiddetli", "çok ağrı" → urgency: yüksek
- Estetik terimler → estetik doktor
- Çocuk → pediatri varsa
- Spam/anlamsız → suggestedDoctorId null
Sadece JSON dön, başka hiçbir şey yazma.
`;

export async function POST(req: Request) {
  const { complaint } = await req.json();
  if (!complaint || complaint.length < 3) {
    return Response.json({ error: "complaint gerekli (min 3 karakter)" }, { status: 400 });
  }

  const [docs, svcs] = await Promise.all([
    db.select().from(doctors).where(eq(doctors.isActive, true)),
    db.select().from(services).where(eq(services.isActive, true)),
  ]);

  const prompt = TRIAGE_PROMPT
    .replace("{{doctors}}", JSON.stringify(docs))
    .replace("{{services}}", JSON.stringify(svcs));

  const result = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 500,
    system: prompt,
    messages: [{ role: "user", content: complaint }],
  });

  const text = result.content[0].type === "text" ? result.content[0].text : "{}";

  try {
    return Response.json(JSON.parse(text));
  } catch {
    return Response.json({ error: "AI yanıtı parse edilemedi", raw: text }, { status: 500 });
  }
}
