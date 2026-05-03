/**
 * Opens WhatsApp with a prefilled message (encodeURIComponent applied by wa.me).
 */
export function whatsappOrderDeepLink(orderNumber: string, grandTotal: string, phoneE164: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const body = encodeURIComponent(
    `Hello, I placed order ${orderNumber} for ₹${grandTotal}. Please confirm dispatch.`,
  );
  return `https://wa.me/${digits}?text=${body}`;
}

export function whatsappSupportDeepLink(phoneE164: string, preset?: string) {
  const digits = phoneE164.replace(/\D/g, "");
  const body = preset ? encodeURIComponent(preset) : "";
  return body ? `https://wa.me/${digits}?text=${body}` : `https://wa.me/${digits}`;
}
