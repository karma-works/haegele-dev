import { describe, expect, it } from 'vitest';
import { createTools, type SiteContent } from '../../src/webmcp/tools';
import * as content from '../../src/content';

const fixture: SiteContent = {
  ...content,
  projects: [
    { id: 'a', hash: 'aaa', title: 'TypeScript', description: 'A language tool', tags: ['TypeScript'], date: '2026-01', status: 'active', image: '/a.png', link: 'https://example.com', demoUrl: 'https://example.com/demo' },
    { id: 'b', hash: 'bbb', title: 'Other', description: 'TypeScript experiment', tags: ['Python'], date: '2025-01', status: 'archived', image: '/b.png' },
    { id: 'c', hash: 'ccc', title: 'Draft', description: 'Work in progress', tags: ['TypeScript'], date: '2026-01', status: 'wip', image: '/c.png' },
  ],
  graveyardProjects: [{ id: 'g', title: 'Retired', epitaph: 'TypeScript lessons', bornDate: '2025-01', deathDate: '2025-02', techStack: ['TypeScript'] }],
  skillCategories: [{ id: 'frontend', title: 'Experience systems', skills: [{ name: 'TypeScript', level: 90 }] }],
};
const tools = createTools(fixture);
async function execute(name: string, input: unknown = {}) {
  const result = await tools.find(t => t.name === name)!.execute(input);
  return { ...result, data: result.isError ? result.content[0]!.text : JSON.parse(result.content[0]!.text) };
}
describe('read-only portfolio tools', () => {
  it('exposes exactly six named, read-only tools with scoped descriptions', () => {
    expect(tools).toHaveLength(6);
    expect(new Set(tools.map(t => t.name)).size).toBe(6);
    for (const tool of tools) {
      expect(tool.annotations.readOnlyHint).toBe(true);
      expect(tool.description).toContain('Christian Hägele');
    }
  });
  it('returns shared profile, channels and full project links', async () => {
    expect((await execute('get_profile')).data).toEqual(fixture.profile);
    expect((await execute('get_contact_channels')).data).toEqual(fixture.contactChannels);
    expect((await execute('get_project', { id: 'a' })).data).toEqual(fixture.projects[0]);
    expect((await execute('get_project', { id: 'missing' })).isError).toBe(true);
  });
  it('combines tag, status, year and limit filters', async () => {
    expect((await execute('list_projects', { tag: ' typescript ', status: 'active', year: '2026', limit: 1 })).data).toEqual([fixture.projects[0]]);
    expect((await execute('list_projects', { status: 'archived' })).data).toEqual([fixture.projects[1]]);
    expect((await execute('list_projects', { status: 'wip' })).data).toEqual([fixture.projects[2]]);
    expect((await execute('list_projects', { year: '2024' })).data).toEqual([]);
    expect((await execute('list_projects')).data).toHaveLength(3);
  });
  it('filters skills by category id or title', async () => {
    for (const category of ['FRONTEND', 'Experience systems']) expect((await execute('get_skills', { category })).data).toEqual(fixture.skillCategories);
    expect((await execute('get_skills')).data).toEqual(fixture.skillCategories);
    expect((await execute('get_skills', { category: 'missing' })).data).toEqual([]);
  });
  it('ranks titles first and searches graveyard and skills with bounded results', async () => {
    const hits = (await execute('search_site', { query: 'TypeScript' })).data;
    expect(hits[0].id).toBe('a');
    expect(hits.map((hit: { type: string }) => hit.type)).toEqual(expect.arrayContaining(['project', 'graveyard', 'skill']));
    expect((await execute('search_site', { query: 'TypeScript', limit: 1 })).data).toHaveLength(1);
    expect((await execute('search_site', { query: '  ' })).data).toEqual([]);
    expect((await execute('search_site', { query: 'TypeScript lessons' })).data[0].id).toBe('g');
  });
  it.each([['list_projects', { limit: -1 }], ['list_projects', { limit: 1.5 }], ['list_projects', { limit: 101 }], ['list_projects', { year: '26' }], ['list_projects', { status: 'bad' }], ['get_project', {}], ['get_project', { id: ' ' }], ['search_site', { query: 5 }], ['get_profile', { submit: true }], ['get_profile', null]])('rejects malformed input to %s', async (name, input) => {
    expect((await execute(name, input)).isError).toBe(true);
  });
});
