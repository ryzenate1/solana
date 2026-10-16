'use client';
import { useId, useState } from 'react';
import { inr, number } from '@/lib/solar';
type Row = { year: number; net: number; generated: number };
export function CashflowChart({ rows, cost }: { rows: Row[]; cost: number }) {
  const id = useId();
  const [view, setView] = useState<'cumulative' | 'annual'>('cumulative');
  const [year, setYear] = useState(10);
  const balances = rows.reduce<number[]>((values, row) => [...values, (values.at(-1) ?? -cost) + row.net], []);
  const values = view === 'cumulative' ? [-cost, ...balances] : [0, ...rows.map(r => r.net)];
  const low = Math.min(0, ...values), high = Math.max(1, ...values), span = high - low;
  const x = (i: number) => 45 + i / 25 * 500, y = (v: number) => 180 - (v - low) / span * 155;
  return <div className="cashflow-chart"><div className="cashflow-heading"><h4>Follow the cash flow.</h4><div className="chart-controls">{(['cumulative','annual'] as const).map(v => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v === 'cumulative' ? 'Cumulative' : 'Annual'}</button>)}</div></div><p className="studio-note">Unlevered, undiscounted scenario. Initial investment at year 0; operating benefits at year end.</p><svg viewBox="0 0 570 220" role="img" aria-labelledby={`${id}-title ${id}-desc`}><title id={`${id}-title`}>25-year {view} cash-flow scenario</title><desc id={`${id}-desc`}>{view === 'cumulative' ? `Starting investment ${inr(cost)}. Year 25 balance ${inr(balances[24])}.` : `Annual operating benefit before financing. Year 1 ${inr(rows[0].net)}, year 25 ${inr(rows[24].net)}.`} Select a year below to inspect the values.</desc><line x1="45" x2="545" y1={y(0)} y2={y(0)} className="chart-zero"/>{[0,5,10,15,20,25].map(i => <g key={i}><line x1={x(i)} x2={x(i)} y1="25" y2="185" className="chart-grid"/><text x={x(i)} y="210" textAnchor="middle">{i === 0 ? 'Year 0' : i}</text></g>)}<polyline points={values.map((v,i) => `${x(i)},${y(v)}`).join(' ')} className="chart-line"/><line x1={x(year)} x2={x(year)} y1="20" y2="185" className="chart-cursor"/><circle cx={x(year)} cy={y(values[year])} r="5" fill="var(--accent)" stroke="var(--background)" strokeWidth="2"/></svg><label className="chart-year" htmlFor={`${id}-year`}>Inspect year {year}<input id={`${id}-year`} type="range" min={1} max={25} value={year} onChange={e => setYear(Number(e.target.value))}/></label><div className="chart-readout" aria-live="polite"><div><span>Year {year} net operating benefit</span><strong>{inr(rows[year-1].net)}</strong></div><div><span>Cumulative balance</span><strong>{inr(balances[year-1])}</strong></div><div><span>Annual generation</span><strong>{number(rows[year-1].generated)} kWh</strong></div></div></div>;
}
