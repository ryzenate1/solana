import { test, expect } from '@playwright/test';
import { filterProjects } from '../src/lib/project-filters';
import type { Project } from '../src/lib/content';

test('proof library filters capacity boundaries, unknown sizes and unverified records', () => {
  // Test fixtures only; these are never published as installations.
  const base = { name:'Test fixture', slug:'test', sector:'Test', location:'Test', image:'/test.webp', description:'Test', commissionedOn:'Test', scope:[], equipment:[], outcomes:[], evidence:[], verified:true as const };
  const records: Project[] = [
    {...base, category:'Residential', capacityKwp:9.9},
    {...base, category:'Commercial', capacityKwp:10},
    {...base, category:'Commercial', capacityKwp:99.9},
    {...base, category:'Industrial', capacityKwp:100},
    {...base, category:'Industrial', capacityKwp:null},
  ];
  expect(filterProjects(records,'All','small')).toHaveLength(1);
  expect(filterProjects(records,'Commercial','medium')).toHaveLength(2);
  expect(filterProjects(records,'All','large')).toHaveLength(1);
  expect(filterProjects(records,'Industrial','all')).toHaveLength(2);
  expect(filterProjects(records,'Residential','large')).toHaveLength(0);
  expect(filterProjects([{...records[0],verified:false} as unknown as Project],'All','all')).toHaveLength(0);
});
