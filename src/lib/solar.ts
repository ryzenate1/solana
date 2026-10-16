// Preliminary scenario model. Yield is a user assumption, never a location/weather lookup.
export type SolarInput = { monthlyKwh: number; tariff: number; roof: number; yield: number; shade: number; selfUse: number; exportRate: number; costPerKw: number; om: number; degradation: number; escalation: number; discount: number; capacity?: number };
export const defaults: SolarInput = { monthlyKwh: 500, tariff: 8, roof: 60, yield: 1450, shade: 10, selfUse: 70, exportRate: 0, costPerKw: 55000, om: 1, degradation: .5, escalation: 0, discount: 8 };
export function npv(flows: number[], rate: number) { return flows.reduce((sum, v, i) => sum + v / (1 + rate) ** i, 0); }
export function irr(flows: number[]) {
  if (!flows.some(v => v > 0) || !flows.some(v => v < 0)) return null;
  let low = -.99, high = 10;
  if (npv(flows, low) * npv(flows, high) > 0) return null;
  for (let i = 0; i < 120; i++) { const mid = (low + high) / 2; if (npv(flows, mid) > 0) low = mid; else high = mid; }
  return (low + high) / 2;
}
export function modelSolar(p: SolarInput) {
  if (Object.values(p).some(v => !Number.isFinite(v) || v < 0) || p.yield <= 0 || p.costPerKw <= 0 || p.selfUse > 100 || p.shade >= 100 || p.degradation > 100) throw new Error('Invalid solar assumptions');
  const netYield = p.yield * (1 - p.shade / 100);
  const capacity = Math.min(p.capacity ?? p.monthlyKwh * 12 / netYield, p.roof / 10);
  const generation = capacity * netYield, cost = capacity * p.costPerKw;
  const rows = Array.from({ length: 25 }, (_, i) => {
    const generated = generation * (1 - p.degradation / 100) ** i;
    const used = Math.min(generated * p.selfUse / 100, p.monthlyKwh * 12);
    const exported = Math.max(0, generated - used);
    const savings = used * p.tariff * (1 + p.escalation / 100) ** i + exported * p.exportRate;
    return { year: i + 1, generated, used, exported, savings, operatingCost: cost * p.om / 100, net: savings - cost * p.om / 100 };
  });
  const flows = [-cost, ...rows.map(r => r.net)];
  let cumulative = -cost, payback: number | null = null;
  for (const r of rows) { const previous = cumulative; cumulative += r.net; if (payback === null && cost > 0 && cumulative >= 0 && r.net > 0) payback = r.year - 1 + -previous / r.net; }
  return { capacity, generation, cost, rows, flows, npv: npv(flows, p.discount / 100), irr: irr(flows), payback, net: rows[0].net };
}
export function annualLoan(principal: number, rate: number, years: number) { const r = rate / 1200, n = years * 12; return r === 0 ? principal / years : principal * r / (1 - (1 + r) ** -n) * 12; }
export const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
export const number = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);
