export function googleMapsDeliverToUrl(parts: {
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
}) {
  const q = [parts.deliveryAddress, parts.deliveryCity, parts.deliveryState, parts.deliveryPincode]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
