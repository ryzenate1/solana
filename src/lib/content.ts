export const site = { name: 'Universal Solar Power Solutions', description: 'Premium solar installations, designed with precision. Engineered for the way you live.' };
export const navigation = [{ label: 'Solutions', href: '/solutions' }, { label: 'Solar studio', href: '/tools' }, { label: 'Projects', href: '/projects' }, { label: 'Service', href: '/service' }, { label: 'Guides', href: '/knowledge' }];
export const solutions = [
  { id: 'residential', number: '01', title: 'Residential solar', line: 'For the place you call home.', description: 'A considered approach to energy, shaped around your roof, your daily routine, and the character of your home.', details: ['Roof and shading assessment', 'System design around household demand', 'Considered cable routes and equipment placement'] },
  { id: 'commercial', number: '02', title: 'Commercial solar', line: 'A new perspective on overheads.', description: 'Put your roof to work. Explore a system planned around your building, operating hours, and long-term energy needs.', details: ['Site and energy-use assessment', 'Design coordinated with building operations', 'A clear plan for installation and monitoring'] },
];
export const process = [
  { title: 'Understand', text: 'It starts with a conversation. Your property, your energy use, and what you want to make possible.' },
  { title: 'Design', text: 'The right system begins on paper. We consider orientation, shading, structure, and the way everything will fit.' },
  { title: 'Install', text: 'A carefully coordinated installation, with attention to the details you see and the connections you don’t.' },
  { title: 'Support', text: 'A clear handover and an agreed plan for monitoring, care, and the questions that come next.' },
];
export const systemParts = [
  { title: 'Solar modules', text: 'Where sunlight becomes electricity. Selected and positioned around the conditions of your roof.' },
  { title: 'Mounting structure', text: 'The connection to the building. Planned for the roof construction and the layout of the array.' },
  { title: 'Inverter', text: 'Converts the modules’ DC electricity into AC electricity for use within the property.' },
  { title: 'Electrical integration', text: 'Cabling, isolation, and protection bring the system into the building’s electrical infrastructure.' },
  { title: 'Monitoring', text: 'A window into system operation, with the available detail determined by the equipment selected.' },
];
export type Project = {
  slug: string; name: string; category: 'Residential' | 'Commercial' | 'Industrial';
  sector: string; location: string; capacityKwp: number | null; image: string;
  description: string; commissionedOn: string; scope: string[];
  equipment: { label: string; value: string }[];
  outcomes: { label: string; value: string; basis: string }[];
  // Only public, client-approved documents belong here. Never put private customer records in this module.
  evidence: { label: string; href: string }[]; verified: true;
};
// Add only approved, verified project records. Empty fields are deliberately not fabricated.
export const projects: Project[] = [];
export const pendingProjectFields = ['Project name', 'Approved photography', 'Location', 'Verified system capacity', 'Client approval'] as const;
