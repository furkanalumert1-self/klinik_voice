"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TriageResult = {
  suggestedDoctorId: string | null;
  suggestedServiceId: string | null;
  urgency: string;
  estimatedDuration: number;
  reasoning: string;
};

type Slot = { date: string; slots: string[] };

const STEPS = ["Şikayet", "Tarih & Doktor", "Onay"];

export default function RandevuPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [complaint, setComplaint] = useState("");
  const [triage, setTriage] = useState<TriageResult | null>(null);

  // Step 2
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Step 3
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [kvkk, setKvkk] = useState(false);

  async function handleTriageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (complaint.length < 30) {
      setError("Lütfen şikayetinizi en az 30 karakter ile açıklayın.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint }),
      });
      const data = await res.json();
      setTriage(data);

      // Müsait saatleri getir
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
      const params = new URLSearchParams({ start: today, end: nextWeek });
      if (data.suggestedDoctorId) params.set("doctorId", data.suggestedDoctorId);

      const slotsRes = await fetch(`/api/appointments/slots?${params}`);
      const slotsData = await slotsRes.json();
      setAvailableSlots(slotsData.slots ?? []);
      setStep(1);
    } catch {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!kvkk) { setError("KVKK onayı gereklidir."); return; }
    if (!selectedSlot) { setError("Lütfen bir randevu saati seçin."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          phone,
          email: email || undefined,
          doctorId: triage?.suggestedDoctorId ?? undefined,
          serviceId: triage?.suggestedServiceId ?? undefined,
          appointmentAt: selectedSlot,
          durationMinutes: triage?.estimatedDuration ?? 30,
          source: "web",
          complaint,
          kvkkConsent: kvkk,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Hata oluştu"); return; }
      router.push(`/randevu/basarili?id=${data.appointment.id}`);
    } catch {
      setError("Randevu oluşturulamadı, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function formatSlot(iso: string) {
    return new Date(iso).toLocaleString("tr-TR", {
      weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Online Randevu</h1>

        {/* Progress */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-sm ${i === step ? "font-semibold" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-12 h-0.5 bg-gray-300 mx-3" />}
            </div>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Step 0: Şikayet */}
        {step === 0 && (
          <form onSubmit={handleTriageSubmit} className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Şikayetinizi Anlatın</h2>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Örn: Sağ alt dişimde 3 gündür şiddetli ağrı var, yemek yiyemiyorum..."
              className="w-full border rounded-lg p-3 text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{complaint.length}/30 karakter minimum</p>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Analiz ediliyor..." : "Devam Et"}
            </button>
          </form>
        )}

        {/* Step 1: Saat seç */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2">Randevu Saati Seçin</h2>
            {triage && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>AI Önerisi:</strong> {triage.reasoning}
                {triage.urgency === "yüksek" && (
                  <p className="text-red-600 font-semibold mt-1">Acil — en kısa sürede görülmeniz önerilir.</p>
                )}
              </div>
            )}
            {availableSlots.length === 0 ? (
              <p className="text-gray-500 text-sm">Müsait saat bulunamadı. Lütfen bizi arayın.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.slice(0, 20).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 text-xs rounded-lg border transition ${selectedSlot === slot ? "bg-blue-600 text-white border-blue-600" : "hover:border-blue-400"}`}
                  >
                    {formatSlot(slot)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(0)} className="flex-1 border py-3 rounded-lg hover:bg-gray-50 transition">Geri</button>
              <button
                onClick={() => { if (!selectedSlot) { setError("Lütfen saat seçin"); return; } setError(""); setStep(2); }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Kişisel bilgiler */}
        {step === 2 && (
          <form onSubmit={handleBooking} className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Bilgilerinizi Girin</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <strong>Seçilen Saat:</strong> {formatSlot(selectedSlot)}
            </div>
            <div className="space-y-3">
              <input
                type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ad Soyad" required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (+90...)" required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta (isteğe bağlı)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-start gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={kvkk} onChange={(e) => setKvkk(e.target.checked)} className="mt-1" />
              <span>
                KVKK kapsamında kişisel verilerimin işlenmesine ve tıbbi kayıt olarak 10 yıl saklanmasına onay veriyorum.
              </span>
            </label>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border py-3 rounded-lg hover:bg-gray-50 transition">Geri</button>
              <button
                type="submit" disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Randevuyu Onayla"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
