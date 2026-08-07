import type { LegalBlock, LegalInline } from '@/lib/types';

/**
 * Renders the extracted legal content model.
 *
 * Every string below is passed as a React CHILD, never as markup. That is the
 * whole reason the extractor emits typed inline nodes instead of HTML strings —
 * it keeps `dangerouslySetInnerHTML` out of the legal path entirely (plan N24).
 */

function Inline({ nodes }: { nodes: LegalInline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.t) {
          case 'b':
            return (
              <strong key={i} className="font-semibold text-white">
                {node.text}
              </strong>
            );
          case 'i':
            return (
              <em key={i} className="italic">
                {node.text}
              </em>
            );
          case 'a': {
            const external = /^https?:/i.test(node.href);
            return (
              <a
                key={i}
                href={node.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="text-gold underline decoration-gold/30 underline-offset-4 transition-colors hover:text-gold-light hover:decoration-gold"
              >
                {node.text}
              </a>
            );
          }
          case 'br':
            return <br key={i} />;
          default:
            return <span key={i}>{node.text}</span>;
        }
      })}
    </>
  );
}

export function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h3':
            return (
              <h3
                key={i}
                className="mb-2.5 mt-8 font-head text-[15px] font-bold text-fg-80"
              >
                {block.text}
              </h3>
            );

          case 'h4':
            return (
              <h4 key={i} className="mb-2 mt-6 font-head text-sm font-bold text-fg-80">
                {block.text}
              </h4>
            );

          case 'p':
            return (
              <p key={i} className="mb-3.5 text-[14.5px] leading-[1.85] text-fg-60">
                <Inline nodes={block.nodes} />
              </p>
            );

          case 'ul':
            return (
              <ul key={i} className="my-4 flex flex-col gap-2">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[14.5px] leading-[1.8] text-fg-60"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold"
                    />
                    <span>
                      <Inline nodes={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol key={i} className="my-4 flex flex-col gap-2">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[14.5px] leading-[1.8] text-fg-60"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-head text-xs font-bold text-gold"
                    >
                      {String(j + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <Inline nodes={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );

          case 'callout':
            return (
              <aside
                key={i}
                className="my-6 rounded-card border-l-2 border-gold/60 bg-gold/[0.05] px-5 py-4 [&>p:last-child]:mb-0"
              >
                <LegalBlocks blocks={block.blocks} />
              </aside>
            );

          case 'contactCard':
            return (
              <div
                key={i}
                className="my-6 flex flex-col gap-4 rounded-card border border-gold/15 bg-white/[0.02] p-5"
              >
                {block.rows.map((row, j) => (
                  <div key={j} className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-gold/20 bg-gold/[0.07] text-base"
                    >
                      {row.icon}
                    </span>
                    {/* `min-w-0` is load-bearing: a flex item defaults to
                        `min-width: auto`, so it refuses to shrink below its
                        content. An email address in this card widened the whole
                        page by 11px at 320px — `overflow-wrap` could not help
                        because the item was never allowed to narrow. */}
                    <div className="min-w-0 pt-1 text-[14.5px] leading-[1.7] text-fg-60">
                      <Inline nodes={row.nodes} />
                    </div>
                  </div>
                ))}
              </div>
            );

          case 'table':
            return (
              /* scroll-x keeps a wide table from ever widening the page —
                 the 128px contract. */
              <div key={i} className="scroll-x my-6 rounded-card border border-gold/15">
                <table className="w-full min-w-[420px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gold/15 bg-gold/[0.05]">
                      {block.head.map((th, j) => (
                        <th
                          key={j}
                          scope="col"
                          className="px-4 py-3 font-head text-[11px] font-bold uppercase tracking-[0.1em] text-gold"
                        >
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, j) => (
                      <tr key={j} className="border-b border-white/6 last:border-0">
                        {row.map((td, k) => (
                          <td
                            key={k}
                            className="px-4 py-3 text-[13.5px] leading-relaxed text-fg-60"
                          >
                            {td}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
