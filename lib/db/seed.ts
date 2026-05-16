import { db, doctors, services, appointments } from "./index";

async function seed() {
  console.log("Seeding...");

  const [doc1, doc2, doc3] = await db.insert(doctors).values([
    {
      fullName: "Ahmet Yılmaz",
      title: "Dt.",
      specialty: "Genel Diş Hekimliği",
      bio: "15 yıllık deneyimli diş hekimi.",
      isActive: true,
      displayOrder: 1,
    },
    {
      fullName: "Elif Kaya",
      title: "Op. Dr.",
      specialty: "Estetik Diş Hekimliği",
      bio: "Implant ve estetik diş tedavileri uzmanı.",
      isActive: true,
      displayOrder: 2,
    },
    {
      fullName: "Mehmet Demir",
      title: "Dr.",
      specialty: "Ortodonti",
      bio: "Ortodontik tedaviler ve invisalign uzmanı.",
      isActive: true,
      displayOrder: 3,
    },
  ]).returning();

  const [svc1, svc2, svc3, svc4, svc5, svc6, svc7, svc8] = await db.insert(services).values([
    { name: "Genel Muayene", description: "Rutin diş kontrolü", durationMinutes: 30, priceFrom: 500, priceTo: 800, isActive: true },
    { name: "Diş Temizliği", description: "Tartar temizleme ve polisaj", durationMinutes: 45, priceFrom: 800, priceTo: 1200, isActive: true },
    { name: "Dolgu", description: "Kompozit dolgu", durationMinutes: 45, priceFrom: 600, priceTo: 1500, isActive: true },
    { name: "Kanal Tedavisi", description: "Endodontik tedavi", durationMinutes: 60, priceFrom: 2000, priceTo: 4000, isActive: true },
    { name: "İmplant", description: "Titanyum implant uygulaması", durationMinutes: 90, priceFrom: 15000, priceTo: 25000, isActive: true },
    { name: "Diş Beyazlatma", description: "Ofis tipi beyazlatma", durationMinutes: 60, priceFrom: 3000, priceTo: 5000, isActive: true },
    { name: "Ortodontik Konsültasyon", description: "Diş teli değerlendirmesi", durationMinutes: 45, priceFrom: 500, priceTo: 1000, isActive: true },
    { name: "Diş Çekimi", description: "Basit ve cerrahi çekim", durationMinutes: 30, priceFrom: 800, priceTo: 2500, isActive: true },
  ]).returning();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(appointments).values([
    { patientName: "Ali Çelik", phone: "+905551111001", appointmentAt: new Date(tomorrow.setHours(9, 0, 0, 0)), doctorId: doc1.id, serviceId: svc1.id, status: "onaylandi", source: "web", complaint: "Genel kontrol" },
    { patientName: "Fatma Şahin", phone: "+905551111002", appointmentAt: new Date(tomorrow.setHours(10, 0, 0, 0)), doctorId: doc1.id, serviceId: svc2.id, status: "talep", source: "voice_agent", complaint: "Diş taşı temizliği" },
    { patientName: "Hasan Kılıç", phone: "+905551111003", appointmentAt: new Date(tomorrow.setHours(11, 0, 0, 0)), doctorId: doc2.id, serviceId: svc6.id, status: "onaylandi", source: "web", complaint: "Dişlerimi beyazlatmak istiyorum" },
    { patientName: "Zeynep Arslan", phone: "+905551111004", appointmentAt: new Date(tomorrow.setHours(14, 0, 0, 0)), doctorId: doc3.id, serviceId: svc7.id, status: "talep", source: "telefon", complaint: "Diş teli sorunu" },
    { patientName: "Mustafa Aydın", phone: "+905551111005", appointmentAt: new Date(tomorrow.setHours(15, 0, 0, 0)), doctorId: doc1.id, serviceId: svc3.id, status: "onaylandi", source: "web", complaint: "Dişimde çürük var" },
    { patientName: "Ayşe Yıldız", phone: "+905551111006", appointmentAt: new Date(nextWeek.setHours(9, 30, 0, 0)), doctorId: doc2.id, serviceId: svc5.id, status: "talep", source: "web", complaint: "İmplant değerlendirmesi" },
    { patientName: "Emre Güneş", phone: "+905551111007", appointmentAt: new Date(nextWeek.setHours(11, 0, 0, 0)), doctorId: doc1.id, serviceId: svc4.id, status: "onaylandi", source: "voice_agent", complaint: "Şiddetli diş ağrısı" },
    { patientName: "Selin Koç", phone: "+905551111008", appointmentAt: new Date(nextWeek.setHours(13, 0, 0, 0)), doctorId: doc3.id, serviceId: svc7.id, status: "onaylandi", source: "web", complaint: "Invisalign bilgi" },
    { patientName: "Burak Öztürk", phone: "+905551111009", appointmentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), doctorId: doc1.id, serviceId: svc1.id, status: "tamamlandi", source: "web", complaint: "Genel kontrol" },
    { patientName: "Merve Aksoy", phone: "+905551111010", appointmentAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), doctorId: doc2.id, serviceId: svc6.id, status: "tamamlandi", source: "voice_agent", complaint: "Beyazlatma" },
  ]);

  console.log("Seed tamamlandı: 3 doktor, 8 hizmet, 10 randevu.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
