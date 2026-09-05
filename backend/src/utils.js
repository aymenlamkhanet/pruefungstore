export function toWhatsAppUrl(number, message) {
  const normalized = String(number).replace(/\D/g, "");
  return `https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(message)}`;
}
