import {
  pgTable, text, timestamp, uuid, integer, jsonb, boolean, index
} from "drizzle-orm/pg-core";

export const doctors = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  title: text("title"),
  specialty: text("specialty"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  priceFrom: integer("price_from"),
  priceTo: integer("price_to"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientName: text("patient_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  tcNo: text("tc_no"),
  dateOfBirth: timestamp("date_of_birth"),

  doctorId: uuid("doctor_id").references(() => doctors.id),
  serviceId: uuid("service_id").references(() => services.id),
  appointmentAt: timestamp("appointment_at").notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),

  status: text("status", {
    enum: ["talep", "onaylandi", "tamamlandi", "iptal", "gelmedi"]
  }).default("talep").notNull(),
  source: text("source", {
    enum: ["web", "voice_agent", "whatsapp", "telefon", "yuzyuze"]
  }).notNull(),

  complaint: text("complaint"),
  internalNotes: text("internal_notes"),

  reminderSentAt: timestamp("reminder_sent_at"),
  secondReminderSentAt: timestamp("second_reminder_sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  reviewRequestedAt: timestamp("review_requested_at"),

  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  dateIdx: index("appointments_date_idx").on(t.appointmentAt),
  statusIdx: index("appointments_status_idx").on(t.status),
  phoneIdx: index("appointments_phone_idx").on(t.phone),
}));

export const voiceCalls = pgTable("voice_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalCallId: text("external_call_id").unique(),
  phone: text("phone").notNull(),
  direction: text("direction", { enum: ["inbound", "outbound"] }).notNull(),
  durationSeconds: integer("duration_seconds"),
  transcript: text("transcript"),
  summary: text("summary"),
  outcome: text("outcome", {
    enum: ["randevu_alindi", "bilgi_verildi", "insan_aktarimi", "cevapsiz", "spam", "hata"]
  }),
  appointmentId: uuid("appointment_id").references(() => appointments.id),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recallExclusions = pgTable("recall_exclusions", {
  phone: text("phone").primaryKey(),
  reason: text("reason"),
  excludedAt: timestamp("excluded_at").defaultNow().notNull(),
});
