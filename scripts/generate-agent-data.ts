import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';
import { profile, projects, graveyardProjects, skillCategories, contactChannels, siteUrl } from '../src/content';

export function generateAgentFiles(): Record<string, string> {
  const intro = `# ${profile.name}\n\n${profile.title} · ${profile.location}\n\n${profile.headline} ${profile.headlineEmphasis}\n\n${profile.positioning}\n\n${profile.availability}\n\nCapabilities: ${profile.capabilities.join(', ')}.`;
  const contacts = Object.entries(contactChannels).map(([name, url]) => `- [${name}](${url})`).join('\n');
  const projectText = projects.map(p => `## ${p.title}\n\n${p.description}\n\nID: ${p.id} · ${p.date} · ${p.status}\n\nTags: ${p.tags.join(', ')}${p.link ? `\n\n[Project link](${p.link})` : ''}${p.demoUrl ? `\n\n[Demo](${p.demoUrl})` : ''}`).join('\n\n');
  return {
    'llms.txt': `${intro}\n\n## Explore\n\n${['about', 'skills', 'projects', 'graveyard', 'hobbies', 'agents', 'contact'].map(s => `- [${s}](${siteUrl}/#${s})`).join('\n')}\n- [Full content](${siteUrl}/llms-full.txt)\n- [Projects JSON](${siteUrl}/data/projects.json)\n- [Profile JSON](${siteUrl}/data/profile.json)\n\n## Contact channels\n\n${contacts}\n`,
    'llms-full.txt': `${intro}\n\n# Projects\n\n${projectText}\n\n# Project graveyard\n\n${graveyardProjects.map(p => `## ${p.title}\n\n${p.epitaph}\n\n${p.bornDate} – ${p.deathDate} · ${p.techStack.join(', ')}${p.link ? `\n\n[Repository](${p.link})` : ''}`).join('\n\n')}\n\n# Skills\n\nSelf-assessed levels on a 0–100 scale.\n\n${skillCategories.map(c => `## ${c.title}\n\n${c.skills.map(s => `- ${s.name}: ${s.level}/100`).join('\n')}`).join('\n\n')}\n\n# Contact channels\n\n${contacts}\n`,
    'data/projects.json': JSON.stringify(projects, null, 2) + '\n',
    'data/profile.json': JSON.stringify(profile, null, 2) + '\n',
  };
}
export function generateAgentData(publicDirectory: string): void {
  for (const [file, content] of Object.entries(generateAgentFiles())) {
    const destination = resolve(publicDirectory, file);
    mkdirSync(resolve(destination, '..'), { recursive: true });
    writeFileSync(destination, content);
  }
}
export function agentDataPlugin(): Plugin {
  let publicDirectory: string;
  return {
    name: 'agent-data',
    configResolved(config) { publicDirectory = config.publicDir; },
    buildStart() { generateAgentData(publicDirectory); },
    transformIndexHtml(html, context) {
      if (context.path !== '/index.html') return html;
      const graph = {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Person', '@id': `${siteUrl}/#person`, name: profile.name, jobTitle: profile.title, description: profile.positioning, url: siteUrl, homeLocation: { '@type': 'Place', name: profile.location }, sameAs: Object.entries(contactChannels).filter(([key]) => key !== 'form').map(([, url]) => url), knowsAbout: skillCategories.flatMap(c => c.skills.map(s => s.name)) },
          ...projects.map(p => ({ '@type': 'CreativeWork', '@id': `${siteUrl}/#${p.id}`, name: p.title, description: p.description, keywords: p.tags, url: p.link ?? `${siteUrl}/#projects`, creator: { '@id': `${siteUrl}/#person` } })),
        ],
      };
      return { html, tags: [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(graph).replace(/</g, '\\u003c'), injectTo: 'head' }] };
    },
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateAgentData(resolve('public'));
}
