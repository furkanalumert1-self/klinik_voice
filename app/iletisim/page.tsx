export default function IletisimPage() {
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME ?? "Klinik";
  const clinicPhone = process.env.NEXT_PUBLIC_CLINIC_PHONE ?? "";
  const clinicAddress = process.env.NEXT_PUBLIC_CLINIC_ADDRESS ?? "";

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-12">İletişim</h1>

        <div className="bg-white border rounded-xl p-6 space-y-4 mb-8">
          <div className="flex gap-3">
            <span className="text-gray-400 w-24">Adres</span>
            <span className="font-medium">{clinicAddress}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 w-24">Telefon</span>
            <a href={`tel:${clinicPhone}`} className="text-blue-600 hover:underline font-medium">{clinicPhone}</a>
          </div>
          <div className="flex gap-3">
            <span className="text-gray-400 w-24">Çalışma</span>
            <span>Pzt–Cuma 09:00–19:00 | Cumartesi 10:00–14:00</span>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400 mb-8">
          Google Maps buraya gömülür
        </div>

        <form className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Mesaj Gönderin</h2>
          <input type="text" placeholder="Adınız" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="tel" placeholder="Telefon" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="Mesajınız..." className="w-full border rounded-lg px-3 py-2 text-sm h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
