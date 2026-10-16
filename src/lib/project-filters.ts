import type { Project } from './content';
export function filterProjects(records: Project[], category: string, size: string) {
  return records.filter(p => p.verified && (category === 'All' || p.category === category) &&
    (size === 'all' || (p.capacityKwp !== null && (size === 'small' ? p.capacityKwp < 10 : size === 'medium' ? p.capacityKwp >= 10 && p.capacityKwp < 100 : p.capacityKwp >= 100))));
}
