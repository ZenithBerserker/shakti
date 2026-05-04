type NotifyOrder = {
  orderNumber: string;
  grandTotal: unknown;
  deliveryName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  user?: { phone: string } | null;
};

/** Fire-and-forget: webhook + optional Twilio SMS when an order is placed. */
export function notifyOrderCreated(order: NotifyOrder): void {
  const grandTotal = String(order.grandTotal);
  const phone = order.user?.phone ?? "";

  const summaryLine = [
    `Shakti new order ${order.orderNumber}`,
    `₹${grandTotal}`,
    order.deliveryName,
    `${order.deliveryCity} ${order.deliveryPincode}`,
    phone ? `Customer ${phone}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const webhook = process.env.ORDER_NOTIFY_WEBHOOK_URL?.trim();
  if (webhook) {
    void fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "order.created",
        orderNumber: order.orderNumber,
        grandTotal,
        deliveryName: order.deliveryName,
        deliveryAddress: order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        deliveryState: order.deliveryState,
        deliveryPincode: order.deliveryPincode,
        customerPhone: phone || null,
      }),
    }).catch((e) => console.error("[order-notify] webhook", e));
  }

  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const to = process.env.ORDER_ALERT_SMS_TO?.trim();

  if (!sid || !token || !from || !to) return;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  void fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: from,
      To: to,
      Body: summaryLine.slice(0, 1400),
    }),
  }).catch((e) => console.error("[order-notify] twilio", e));
}
