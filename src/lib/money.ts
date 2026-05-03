export function decToString(value: number | { toString(): string }) {
  const n = typeof value === "number" ? value : Number(value.toString());
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
