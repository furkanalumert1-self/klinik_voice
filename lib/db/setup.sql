-- ============================================================
-- Alumert Klinik — Veritabanı Kurulum SQL
-- Neon Dashboard > SQL Editor'a yapıştır ve çalıştır
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Doktorlar
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  title TEXT,
  specialty TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0
);

-- Hizmetler
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_from INTEGER,
  price_to INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Randevular
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  tc_no TEXT,
  date_of_birth TIMESTAMP,
  doctor_id UUID REFERENCES doctors(id),
  service_id UUID REFERENCES services(id),
  appointment_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'talep' CHECK (status IN ('talep','onaylandi','tamamlandi','iptal','gelmedi')),
  source TEXT NOT NULL CHECK (source IN ('web','voice_agent','whatsapp','telefon','yuzyuze')),
  complaint TEXT,
  internal_notes TEXT,
  reminder_sent_at TIMESTAMP,
  second_reminder_sent_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  review_requested_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(appointment_at);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS appointments_phone_idx ON appointments(phone);

-- Sesli çağrı logları
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_call_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  duration_seconds INTEGER,
  transcript TEXT,
  summary TEXT,
  outcome TEXT CHECK (outcome IN ('randevu_alindi','bilgi_verildi','insan_aktarimi','cevapsiz','spam','hata')),
  appointment_id UUID REFERENCES appointments(id),
  recording_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Recall dışlama listesi
CREATE TABLE IF NOT EXISTS recall_exclusions (
  phone TEXT PRIMARY KEY,
  reason TEXT,
  excluded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA — Test verileri
-- ============================================================

INSERT INTO doctors (full_name, title, specialty, bio, is_active, display_order) VALUES
  ('Ahmet Yılmaz', 'Dt.', 'Genel Diş Hekimliği', '15 yıllık deneyimli diş hekimi.', true, 1),
  ('Elif Kaya', 'Op. Dr.', 'Estetik Diş Hekimliği', 'Implant ve estetik diş tedavileri uzmanı.', true, 2),
  ('Mehmet Demir', 'Dr.', 'Ortodonti', 'Ortodontik tedaviler ve invisalign uzmanı.', true, 3)
ON CONFLICT DO NOTHING;

INSERT INTO services (name, description, duration_minutes, price_from, price_to, is_active) VALUES
  ('Genel Muayene', 'Rutin diş kontrolü', 30, 500, 800, true),
  ('Diş Temizliği', 'Tartar temizleme ve polisaj', 45, 800, 1200, true),
  ('Dolgu', 'Kompozit dolgu', 45, 600, 1500, true),
  ('Kanal Tedavisi', 'Endodontik tedavi', 60, 2000, 4000, true),
  ('İmplant', 'Titanyum implant uygulaması', 90, 15000, 25000, true),
  ('Diş Beyazlatma', 'Ofis tipi beyazlatma', 60, 3000, 5000, true),
  ('Ortodontik Konsültasyon', 'Diş teli değerlendirmesi', 45, 500, 1000, true),
  ('Diş Çekimi', 'Basit ve cerrahi çekim', 30, 800, 2500, true)
ON CONFLICT DO NOTHING;

-- Test randevuları (yarın ve gelecek hafta)
INSERT INTO appointments (patient_name, phone, appointment_at, status, source, complaint)
SELECT 'Ali Çelik', '+905551111001', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', 'onaylandi', 'web', 'Genel kontrol'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE phone = '+905551111001');

INSERT INTO appointments (patient_name, phone, appointment_at, status, source, complaint)
SELECT 'Fatma Şahin', '+905551111002', NOW() + INTERVAL '1 day' + INTERVAL '10 hours', 'talep', 'voice_agent', 'Diş taşı temizliği'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE phone = '+905551111002');

INSERT INTO appointments (patient_name, phone, appointment_at, status, source, complaint)
SELECT 'Burak Öztürk', '+905551111009', NOW() - INTERVAL '2 days', 'tamamlandi', 'web', 'Genel kontrol'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE phone = '+905551111009');

-- Tablo kontrolü
SELECT 'doctors' as tablo, COUNT(*) as kayit FROM doctors
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'voice_calls', COUNT(*) FROM voice_calls;
