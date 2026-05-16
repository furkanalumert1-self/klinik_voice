import Link from "next/link";

export default function BasariliPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl p-8 shadow-sm max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Randevunuz Alındı!</h1>
        <p className="text-gray-500 mb-6">
          Randevunuz oluşturuldu. WhatsApp üzerinden onay mesajı gönderilecek.
          24 saat ve 2 saat öncesinden hatırlatma yapılacak.
        </p>
        {searchParams.id && (
          <p className="text-xs text-gray-400 mb-6">Randevu No: {searchParams.id}</p>
        )}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            href={`/api/appointments/${searchParams.id}/cancel`}
            className="block w-full border py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
          >
            Randevuyu İptal Et
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Değişiklik için: {process.env.NEXT_PUBLIC_CLINIC_PHONE}
        </p>
      </div>
    </div>
  );
}
