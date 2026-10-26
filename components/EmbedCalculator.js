/* Shared renderer for the bare /embed/* routes. Renders ONLY the tool
   itself (same component and code path as the canonical tool page) plus
   the visible attribution footer that earns the backlink. Custom-component
   tools (pay stub generator) render their dedicated component, everything
   else goes through ToolRunner with the tool's own calcKey and inputs. */
import ToolRunner from '@/components/ToolRunner';
import PayStubTool from '@/components/paystub/PayStubTool';

export default function EmbedCalculator({ tool, lang, canonical }) {
  const isEs = lang === 'es';
  return (
    <div className="embed-wrap">
      <div className="embed-head">
        <h1>{tool.name}</h1>
        <p>{tool.tagline}</p>
      </div>
      {tool.customComponent && tool.customComponent.startsWith('pay-') ? (
        <PayStubTool lang={lang} />
      ) : (
        <ToolRunner calcKey={tool.calcKey} inputs={tool.inputs} lang={lang} />
      )}
      <p className="embed-foot">
        {isEs ? 'Cortesía de ' : 'Powered by '}
        <a href={canonical} target="_blank" rel="noopener">
          The Utility Hub: {tool.name}
        </a>
      </p>
    </div>
  );
}
