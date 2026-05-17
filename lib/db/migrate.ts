import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Client } from "pg";

// channel_binding parametresini URL'den kaldır (pg desteklemiyor)
const rawUrl = process.env.DATABASE_URL!;
const cleanUrl = rawUrl.replace(/[?&]channel_binding=[^&]*/g, (m) =>
  m.startsWith("?") ? "?" : ""
).replace(/\?$/, "");

const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_from INTEGER,
  price_to INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true
);

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

CREATE TABLE IF NOT EXISTS recall_exclusions (
  phone TEXT PRIMARY KEY,
  reason TEXT,
  excluded_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

async function migrate() {
  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Bağlantı kuruldu. Tablolar oluşturuluyor...");
  await client.query(SQL);
  console.log("✓ Tüm tablolar oluşturuldu.");
  await client.end();
}

migrate().catch((e) => { console.error(e); process.exit(1); });
