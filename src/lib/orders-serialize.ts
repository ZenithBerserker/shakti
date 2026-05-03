import type { Order, OrderItem } from "@prisma/client";
import { decToString } from "@/lib/money";

export type OrderWithItems = Order & { items: OrderItem[] };

export function serializeOrder(o: OrderWithItems) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    customerNotes: o.customerNotes,
    deliveryName: o.deliveryName,
    deliveryAddress: o.deliveryAddress,
    deliveryCity: o.deliveryCity,
    deliveryState: o.deliveryState,
    deliveryPincode: o.deliveryPincode,
    subTotal: decToString(o.subTotal),
    totalGst: decToString(o.totalGst),
    shippingCost: decToString(o.shippingCost),
    grandTotal: decToString(o.grandTotal),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitPricePaid: decToString(i.unitPricePaid),
      gstAmountPaid: decToString(i.gstAmountPaid),
      totalPrice: decToString(i.totalPrice),
    })),
  };
}
