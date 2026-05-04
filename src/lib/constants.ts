export const LOW_STOCK_THRESHOLD = Number(
  process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD ?? "15",
);

export const DEFAULT_SHIPPING_FLAT = Number(
  process.env.DEFAULT_SHIPPING_FLAT ?? "0",
);

export const SUPPORT_WHATSAPP_E164 =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "";

export const BUSINESS_WHATSAPP_E164 =
  process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_ORDER ?? "";

/** Ops / warehouse WhatsApp for dispatch drafts (falls back to business order inbox). */
export const DISPATCH_WHATSAPP_E164 =
  process.env.NEXT_PUBLIC_DISPATCH_WHATSAPP?.trim() || BUSINESS_WHATSAPP_E164;
