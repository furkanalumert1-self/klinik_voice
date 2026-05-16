import { appointments } from "@/lib/db/schema";

type Appointment = typeof appointments.$inferSelect;

export function generateSlots(
  date: Date,
  existingAppointments: Appointment[],
  slotDuration = 30
): string[] {
  const slots: string[] = [];
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  const end = new Date(date);
  end.setHours(19, 0, 0, 0);

  const day = date.getDay();
  if (day === 0) return []; // Pazar kapalı
  if (day === 6) end.setHours(14, 0, 0, 0); // Cumartesi 14:00'da kapanır

  const booked = existingAppointments.map((a) => ({
    start: new Date(a.appointmentAt).getTime(),
    end: new Date(a.appointmentAt).getTime() + a.durationMinutes * 60 * 1000,
  }));

  const cursor = new Date(start);
  while (cursor < end) {
    const slotStart = cursor.getTime();
    const slotEnd = slotStart + slotDuration * 60 * 1000;

    const conflict = booked.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );

    if (!conflict) {
      slots.push(cursor.toISOString());
    }

    cursor.setMinutes(cursor.getMinutes() + slotDuration);
  }

  return slots;
}

export function formatTurkishDate(date: Date): string {
  return date.toLocaleString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
