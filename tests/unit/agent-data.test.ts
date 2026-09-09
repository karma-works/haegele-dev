import { expect, it } from 'vitest';
import { generateAgentFiles } from '../../scripts/generate-agent-data';
import { profile, projects, graveyardProjects, skillCategories } from '../../src/content';
it('generates static content from the same records used in the UI and tools', () => {
  const files = generateAgentFiles();
  expect(JSON.parse(files['data/profile.json']!)).toEqual(profile);
  expect(JSON.parse(files['data/projects.json']!)).toEqual(projects);
  for (const record of [...projects, ...graveyardProjects, ...skillCategories]) expect(files['llms-full.txt']).toContain(record.title);
  expect(files['llms.txt']).toContain('https://haegele.dev/llms-full.txt');
  expect(files['llms-full.txt']).not.toContain('<svg');
});
