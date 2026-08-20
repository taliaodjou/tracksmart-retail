export function lineGross(item) {
  return (Number(item.qty) || 0) * (Number(item.price) || 0);
}

export function lineDiscountAmount(item) {
  const pct = Math.min(Math.max(Number(item.discount) || 0, 0), 100);
  return lineGross(item) * (pct / 100);
}

export function lineTotal(item) {
  return lineGross(item) - lineDiscountAmount(item);
}