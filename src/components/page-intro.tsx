import { ArrowDownRight } from 'lucide-react';
export function PageIntro({ label, title, text }: { label: string; title: React.ReactNode; text: string }) { return <div className="page-intro section-shell"><div className="eyebrow"><span className="status-dot"/>{label}</div><h1>{title}</h1><div className="page-intro-bottom"><ArrowDownRight size={38} strokeWidth={1}/><p>{text}</p></div></div>; }
