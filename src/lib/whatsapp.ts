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

/** Warehouse / ops WhatsApp draft (delivery-run sheet). */
export function whatsappOpsNewOrderDeepLink(opts: {
  phoneE164: string;
  orderNumber: string;
  grandTotal: string;
  customerPhone: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
}) {
  const digits = opts.phoneE164.replace(/\D/g, "");
  const line = `${opts.deliveryAddress}, ${opts.deliveryCity}, ${opts.deliveryState} ${opts.deliveryPincode}`;
  const body = encodeURIComponent(
    [
      `NEW ORDER ${opts.orderNumber}`,
      `Total: ₹${opts.grandTotal}`,
      `Customer: ${opts.customerPhone}`,
      `Deliver to: ${opts.deliveryName}`,
      line,
    ].join("\n"),
  );
  return `https://wa.me/${digits}?text=${body}`;
}
