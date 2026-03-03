/**
 * buildBookingReminder — pure function, no side effects.
 * Selects the right reminder message based on available lead contact info.
 *
 * @param {{ email?: string, phone?: string } | null} lead
 * @param {{ bookingReminderBoth: string, bookingReminderEmailOnly: string, bookingReminderPhoneOnly: string, bookingReminderGeneric: string }} t - i18n strings
 * @returns {string}
 */
export function buildBookingReminder(lead, t) {
  const hasEmail = !!lead?.email;
  const hasPhone = !!lead?.phone;

  if (hasEmail && hasPhone) return t.bookingReminderBoth;
  if (hasEmail)             return t.bookingReminderEmailOnly;
  if (hasPhone)             return t.bookingReminderPhoneOnly;
  return t.bookingReminderGeneric;
}
