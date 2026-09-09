import { profile, projects, skillCategories, graveyardProjects, contactChannels } from '../content';

interface Parameter {
  type: 'string' | 'integer';
  description: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  minLength?: number;
}
export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, Parameter>; required: string[]; additionalProperties: false };
  annotations: { readOnlyHint: true };
  execute: (input: unknown) => Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }>;
}
export interface SiteContent {
  profile: typeof profile;
  projects: typeof projects;
  skillCategories: typeof skillCategories;
  graveyardProjects: typeof graveyardProjects;
  contactChannels: typeof contactChannels;
}
const limitParameter: Parameter = { type: 'integer', description: 'Maximum results, default 10 (1–100).', minimum: 1, maximum: 100 };
const normalize = (value: string) => value.trim().toLocaleLowerCase('en');

function defineTool(name: string, description: string, properties: Record<string, Parameter>, required: string[], run: (input: Record<string, string | number>) => unknown): WebMCPTool {
  return {
    name, description, inputSchema: { type: 'object', properties, required, additionalProperties: false },
    annotations: { readOnlyHint: true },
    async execute(input = {}) {
      try {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Expected an input object.');
        const values = input as Record<string, string | number>;
        for (const key of required) if (!Object.hasOwn(values, key)) throw new Error(`Missing required parameter: ${key}`);
        for (const [key, value] of Object.entries(values)) {
          const param = properties[key];
          if (!Object.hasOwn(properties, key) || !param) throw new Error(`Unknown parameter: ${key}`);
          if (param.type === 'integer' ? typeof value !== 'number' || !Number.isInteger(value) || value < (param.minimum ?? 0) || value > (param.maximum ?? Infinity) : typeof value !== 'string') throw new Error(`Invalid parameter: ${key}`);
          if (typeof value === 'string' && ((param.enum && !param.enum.includes(value)) || (param.pattern && !new RegExp(param.pattern).test(value)) || (param.minLength && value.trim().length < param.minLength))) throw new Error(`Invalid parameter: ${key}`);
        }
        return { content: [{ type: 'text', text: JSON.stringify(run(values)) }] };
      } catch (error) {
        return { isError: true, content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unable to read content.' }] };
      }
    },
  };
}

export function createTools(content: SiteContent): WebMCPTool[] {
  return [
    defineTool('get_profile', "Read Christian Hägele's role, location, positioning, availability and capability areas.", {}, [], () => content.profile),
    defineTool('list_projects', "List Christian Hägele's software projects, filtered by technology tag, status or year.", {
      tag: { type: 'string', description: 'Technology tag, matched exactly ignoring case.' },
      status: { type: 'string', enum: ['active', 'archived', 'wip'], description: 'Project status.' },
      year: { type: 'string', pattern: '^\\d{4}$', description: 'Four-digit year, e.g. 2026.' }, limit: limitParameter,
    }, [], ({ tag, status, year, limit = 10 }) => content.projects.filter(project =>
      (!tag || project.tags.some(value => normalize(value) === normalize(String(tag)))) &&
      (!status || project.status === status) && (!year || project.date.startsWith(String(year)))
    ).slice(0, Number(limit))),
    defineTool('get_project', "Read a complete Christian Hägele project record, including available repository and demo links.", {
      id: { type: 'string', minLength: 1, description: 'Project ID returned by list_projects.' },
    }, ['id'], ({ id }) => {
      const project = content.projects.find(project => project.id === id);
      if (!project) throw new Error(`Unknown project: ${id}`);
      return project;
    }),
    defineTool('get_skills', "Read Christian Hägele's skill categories and self-assessed levels (0–100).", {
      category: { type: 'string', description: 'Category ID or title, matched exactly ignoring case.' },
    }, [], ({ category }) => content.skillCategories.filter(value => !category || [value.id, value.title].some(text => normalize(text) === normalize(String(category))))),
    defineTool('search_site', "Search Christian Hägele's projects, project graveyard and skills. Returns ranked matches; an empty query returns no hits.", {
      query: { type: 'string', description: 'Search words; all words must match. Titles rank above descriptions.' }, limit: limitParameter,
    }, ['query'], ({ query, limit = 10 }) => {
      const terms = normalize(String(query)).split(/\s+/).filter(Boolean);
      if (!terms.length) return [];
      const records = [
        ...content.projects.map(p => ({ type: 'project', id: p.id, title: p.title, description: p.description, tags: p.tags, url: '#projects' })),
        ...content.graveyardProjects.map(p => ({ type: 'graveyard', id: p.id, title: p.title, description: p.epitaph, tags: p.techStack, url: '#graveyard' })),
        ...content.skillCategories.map(c => ({ type: 'skill', id: c.id, title: c.title, description: c.skills.map(s => s.name).join(', '), tags: c.skills.map(s => s.name), url: '#skills' })),
      ];
      return records.map(record => {
        const title = normalize(record.title);
        const body = normalize(`${record.title} ${record.description} ${record.tags.join(' ')}`);
        const score = terms.every(term => body.includes(term)) ? terms.reduce((sum, term) => sum + (title === term ? 10 : title.includes(term) ? 5 : record.tags.some(tag => normalize(tag) === term) ? 3 : 1), 0) : 0;
        return { ...record, score };
      }).filter(hit => hit.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, Number(limit));
    }),
    defineTool('get_contact_channels', "Read Christian Hägele's public social links and contact form URL. Does not submit messages.", {}, [], () => content.contactChannels),
  ];
}
export const tools = createTools({ profile, projects, skillCategories, graveyardProjects, contactChannels });
