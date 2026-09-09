import { memo, useEffect, useState } from 'react';
import { tools } from '../../webmcp/tools';
import { getModelContextSource } from '../../webmcp/modelContext';
import styles from './AgentInterface.module.css';

export default memo(function AgentInterface() {
  const [source, setSource] = useState(getModelContextSource);
  useEffect(() => {
    const update = () => setSource(getModelContextSource());
    window.addEventListener('focus', update);
    const interval = window.setInterval(update, 3000);
    return () => { window.removeEventListener('focus', update); window.clearInterval(interval); };
  }, []);
  return (
    <section id="agents" className={styles.section} aria-labelledby="agent-heading">
      <div className={styles.container}>
        <p className={styles.eyebrow}>FOR PEOPLE AND THEIR AGENTS</p>
        <h2 id="agent-heading">An interface for your AI.</h2>
        <p className={styles.intro}>Explore my work through six read-only tools. They use the same content as this page.</p>
        <p role="status" className={styles.status}>
          {source === 'document' ? 'Browser API detected · document.modelContext' : source === 'navigator' ? 'Legacy browser API detected · navigator.modelContext' : 'WebMCP is not available in this browser.'}
          <span>{source ? 'Compatible agents can discover page tools through this browser API.' : 'The tool catalog below documents the interface; use the text and JSON links to read the content in this browser.'}</span>
        </p>
        <div className={styles.links}>
          <a href="/llms.txt">Agent index ↗</a>
          <a href="/llms-full.txt">Full text ↗</a>
          <a href="/data/projects.json">Projects JSON ↗</a>
        </div>
        <div className={styles.grid}>
          {tools.map(tool => (
            <article key={tool.name} className={styles.card}>
              <h3><code>{tool.name}</code></h3>
              <p>{tool.description}</p>
              <p className={styles.parameters}>{Object.keys(tool.inputSchema.properties).length === 0 ? 'No parameters' : 'Parameters'}</p>
              <dl>{Object.entries(tool.inputSchema.properties).map(([name, parameter]) => (
                <div key={name}><dt><code>{name}</code> · {parameter.type} · {tool.inputSchema.required.includes(name) ? 'required' : 'optional'}</dt><dd>{parameter.description}{parameter.enum ? ` Values: ${parameter.enum.join(', ')}.` : ''}</dd></div>
              ))}</dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
});
