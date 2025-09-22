import React, { Suspense } from 'react';
import {
  WidgetContext,
  htmlAttributes,
} from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { LegalDocumentEntity, LegalSection, LegalDocItem } from './legalDocument.entity';

const LEGAL_DOC_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.LegalDocument'; 
const SECTIONS_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Sections'; 

function slugify(s: string) {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function LegalDocument(
  props: WidgetContext<LegalDocumentEntity>
) {
  const attrs = htmlAttributes(props);

  let selection = props.model?.Properties?.LegalDoc;
  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let doc: any;
  let sections: LegalSection[] = [];
   const id = selection?.ItemIdsOrdered?.[0]?.toString();
    const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();
  if (selection?.Content?.length) {
    doc = await RestClient.getItem({
           id,
        provider,
      type: LEGAL_DOC_TYPE,
      culture: props.requestContext.culture,
      traceContext: props.traceContext,
      fields: ['Id', 'Title'],
    });

    
    const res = await RestClient.getItems({
      type: SECTIONS_TYPE,
      culture: props.requestContext.culture,
      traceContext: props.traceContext,
      fields: ['Id', 'SectionHeader', 'Description', 'Order', 'ParentId'],
    //   sortExpression: 'Order ASC, SectionHeader ASC',
    //   filter: `ParentId == ${doc?.Id}`,
      skip: 0,
      take: 200,
    });

    sections = (res?.Items ?? []) as unknown as LegalSection[];
  }

  if (!doc) {
    return (
      <div {...attrs}>
        <div className="sf-error">Select a LegalDocument item in the designer.</div>
      </div>
    );
  }

  const showNumbering = !!props.model?.Properties?.ShowNumbering;
  const sticky = !!props.model?.Properties?.StickyNav;
  const offset = Number(props.model?.Properties?.ScrollOffset ?? 0);

  return (
    <div {...attrs}>
      <div className="sf-ldoc">
        <div className="sf-ldoc__grid">
          <aside className={`sf-ldoc__nav${sticky ? ' sf-ldoc__nav--sticky' : ''}`}>
            <h3 className="sf-ldoc__title">{doc.Title}</h3>
            <nav>
              <ul>
                {sections.map((s, i) => {
                  const slug = slugify(s.SectionHeader || `section-${i + 1}`);
                  return (
                    <li key={s.Id}>
                      <a
                        className="sf-ldoc__link"
                        href={`#${slug}`}
                        data-target={slug}
                        data-index={i + 1}
                      >
                        {showNumbering ? `${i + 1}. ` : ''}
                        {s.SectionHeader}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <main className="sf-ldoc__content">
            {sections.map((s, i) => {
              const slug = slugify(s.SectionHeader || `section-${i + 1}`);
              return (
                <section key={s.Id} id={slug} className="sf-ldoc__section" data-index={i + 1}>
                  <h4 className="sf-ldoc__sectionTitle">
                    {showNumbering ? <span className="sf-ldoc__no">{i + 1}</span> : null}
                    {s.SectionHeader}
                  </h4>
                  <div
                    className="sf-ldoc__rich"
                    dangerouslySetInnerHTML={{ __html: s.Description ?? '' }}
                  />
                </section>
              );
            })}
          </main>
        </div>
      </div>

      <style>{`
        .sf-ldoc__grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }
        .sf-ldoc__nav {
          max-height: 100%;
        }
        .sf-ldoc__nav--sticky {
          position: sticky;
          top: 16px;
        }
        .sf-ldoc__title {
          margin: 0 0 12px;
          font-weight: 700;
        }
        .sf-ldoc__link {
          display: block;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
        }
        .sf-ldoc__link[aria-current='true'],
        .sf-ldoc__link:hover {
          background: #f3f4f6;
        }
        .sf-ldoc__content {
          min-height: 300px;
        }
        .sf-ldoc__section {
          scroll-margin-top: ${offset}px;
          padding: 16px 0;
          border-bottom: 1px solid #eee;
        }
        .sf-ldoc__sectionTitle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 8px;
          font-weight: 700;
        }
        .sf-ldoc__no {
          display: inline-flex;
          width: 28px;
          height: 28px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid #ddd;
          font-size: 12px;
        }
        .sf-ldoc__rich :global(p) {
          margin: 0 0 12px;
          line-height: 1.7;
        }
      `}</style>

      <ScriptForLegalDocument offset={offset} />
    </div>
  );
}

function ScriptForLegalDocument({ offset }: { offset: number }) {
  return (
    <Suspense>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  const links = Array.from(document.querySelectorAll('.sf-ldoc__link'));
  const sections = Array.from(document.querySelectorAll('.sf-ldoc__section'));
  // Smooth scroll with offset
  links.forEach(a=>{
    a.addEventListener('click', function(e){
      const id = this.getAttribute('data-target');
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - (${offset} || 0);
      window.scrollTo({top:y, behavior:'smooth'});
      history.replaceState(null, '', '#' + id);
    });
  });

  // Scroll spy (IntersectionObserver)
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const active = document.querySelector('.sf-ldoc__link[aria-current="true"]');
      if(entry.isIntersecting){
        if(active) active.removeAttribute('aria-current');
        const toActivate = document.querySelector('.sf-ldoc__link[data-target="'+id+'"]');
        if(toActivate) toActivate.setAttribute('aria-current','true');
      }
    });
  }, { rootMargin: '-${offset}px 0px -70% 0px', threshold: 0.01 });

  sections.forEach(sec=>io.observe(sec));
})();
`,
        }}
      />
    </Suspense>
  );
}
