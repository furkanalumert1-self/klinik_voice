import Link from "next/link";

export default function Home() {
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Klinik";
  const clinicPhone = process.env.NEXT_PUBLIC_CLINIC_PHONE ?? "";
  const clinicAddress = process.env.NEXT_PUBLIC_CLINIC_ADDRESS ?? "";

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-blue-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">{clinicName}</h1>
        <p className="text-xl mb-2">7/24 Sesli Asistan ile Randevu Alın</p>
        <p className="text-blue-200 mb-8">{clinicAddress}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/randevu" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
            Online Randevu Al
          </Link>
          <a href={`tel:${clinicPhone}`} className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
            {clinicPhone}
          </a>
        </div>
      </section>

      {/* Özellikler */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">Neden Bizi Seçmelisiniz?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "7/24 AI Asistan", desc: "Gece yarısı bile telefon asistanımız randevunuzu alır." },
            { title: "WhatsApp Hatırlatma", desc: "24 saat ve 2 saat öncesinden otomatik hatırlatma." },
            { title: "Kolay İptal/Değişiklik", desc: "WhatsApp'tan 'İPTAL' yazarak randevunuzu iptal edin." },
          ].map((f) => (
            <div key={f.title} className="border rounded-xl p-6 text-center hover:shadow-md transition">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Linkler */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center">
          <Link href="/hizmetler" className="bg-white border px-6 py-3 rounded-lg hover:shadow transition">Hizmetlerimiz</Link>
          <Link href="/doktorlarimiz" className="bg-white border px-6 py-3 rounded-lg hover:shadow transition">Doktorlarımız</Link>
          <Link href="/iletisim" className="bg-white border px-6 py-3 rounded-lg hover:shadow transition">İletişim</Link>
          <Link href="/randevu" className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition">Randevu Al</Link>
        </div>
      </section>
    </main>
  );
}
