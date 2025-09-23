import React, { Suspense } from 'react';
import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import type { LegalDocumentEntity, LegalSection } from './legalDocument.entity';
import { resolveSitefinitySelection } from '../../../utils/utils';

const LEGAL_DOC_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Legaldocument';
const SECTIONS_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Sections';

function slugify(s: string) {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function LegalDocument(props: WidgetContext<LegalDocumentEntity>) {
  const hasModel = !!props?.model;
  const attrs = hasModel ? htmlAttributes(props) : {};
  if (!hasModel) {
    return (
      <div {...attrs}>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Configure the Legal Document widget.
        </div>
      </div>
    );
  }

  const model = props.model!.Properties as any;
  const legalDocSel = resolveSitefinitySelection(model?.LegalDocRoot);
  const sectionsSel = resolveSitefinitySelection(model?.SectionsSelection);

  if (!legalDocSel?.Content?.length) {
    return (
      <div {...attrs}>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Pick a Legal document (root).
        </div>
      </div>
    );
  }

  const doc = await RestClientForContext.getItem(legalDocSel, {
    type: LEGAL_DOC_TYPE,
    ...(props.requestContext?.culture ? { culture: props.requestContext.culture } : {}),
    ...(props.traceContext ? { traceContext: props.traceContext } : {}),
  });

  let sections: LegalSection[] = [];
  if (sectionsSel?.Content?.length) {
    const res = await RestClientForContext.getItems(sectionsSel, {
      type: SECTIONS_TYPE,
      ...(props.requestContext?.culture ? { culture: props.requestContext.culture } : {}),
      ...(props.traceContext ? { traceContext: props.traceContext } : {}),
      fields: ['Id', 'SectionHeader', 'Description', 'Order', 'ParentId'],
    });
    sections = (res?.Items ?? []).map((item) => ({
      Id: item.Id,
      SectionHeader: item.SectionHeader,
      Description: item.Description,
      Order: item.Order,
      ParentId: item.ParentId,
    })) as LegalSection[];
  }

  if (!doc) {
    return (
      <div {...attrs}>
        <div className="rounded-xl border p-4 text-sm ">
          Select a LegalDocument item in the designer.
        </div>
      </div>
    );
  }

  const offset = 0;

  return (
    <div {...attrs}>
      <div className="sf-ldoc">
        <div className="mx-auto grid gap-6 md:grid-cols-[320px_1fr]">
          <aside className="self-start md:sticky md:top-6">
            <nav className="rounded-2xl bg-[#010663] shadow-lg">
              <ul className="rounded-2xl overflow-hidden bg-[#010663] ">
                {sections.map((s, i) => {
                  const slug = slugify(s.SectionHeader || `section-${i + 1}`);
                  //   const isActive = (props.activeSectionId === s.Id);
                  return (
                    <li key={s.Id}>
                      <a
                        className={`sf-ldoc__link flex items-center justify-between px-6 py-5 text-[15px] border-b transition last:border-b-0 border-white/10`}
                        href={`#${slug}`}
                        data-target={slug}
                        data-index={i + 1}
                      >
                        <span className="truncate">{s.SectionHeader}</span>
                        <svg
                          className={`h-4 w-4 shrink-0 transition-transform text-blue-700 rotate-90`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                        </svg>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
          <main className="min-h-[320px] rounded-2xl bg-white p-6 md:p-7 ring-1 ring-slate-200 shadow-sm">
            {sections.map((s, i) => {
              const slug = slugify(s.SectionHeader || `section-${i + 1}`);
              return (
                <section
                  key={s.Id}
                  id={slug}
                  className="sf-ldoc__section scroll-mt-[var(--ldoc-offset,0px)] py-4"
                  data-index={i + 1}
                >
                  <h4 className="mb-3 text-[20px] font-extrabold leading-snug text-slate-900">
                    {s.SectionHeader}
                  </h4>
                  <div
                    className="prose prose-slate max-w-none prose-p:my-3 prose-li:my-1 prose-h2:my-3 prose-h3:my-2"
                    dangerouslySetInnerHTML={{ __html: s.Description ?? '' }}
                  />
                </section>
              );
            })}
          </main>
        </div>
      </div>

      <ScriptForLegalDocument offset={offset} />
    </div>
  );
}

function ScriptForLegalDocument({ offset }: { offset: number }) {
  return (
    <Suspense>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  const OFFSET = ${offset} || 0;
  document.documentElement.style.setProperty('--ldoc-offset', OFFSET + 'px');

  const links = Array.from(document.querySelectorAll('.sf-ldoc__link'));
  const sections = Array.from(document.querySelectorAll('.sf-ldoc__section'));

  // Smooth scroll
  links.forEach(a=>{
    a.addEventListener('click', function(e){
      const id = this.getAttribute('data-target');
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null,'','#'+id);
    });
  });

  function setActive(id){
    // remove Tailwind utility classes first
    links.forEach(l=>{
      l.classList.remove('active','bg-slate-900','text-white','ring-1','ring-slate-900');
    });
    const to = links.find(l=>l.getAttribute('data-target')===id);
    if(to){
      // add Tailwind classes only
      to.classList.add('active','bg-slate-900','text-white','ring-1','ring-slate-900');
    }
  }

  if(location.hash){
    const id = location.hash.replace('#','');
    setActive(id);
  }

  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const topEdge = OFFSET + 1;
      let currentId = sections[0]?.id;
      for(const sec of sections){
        const rect = sec.getBoundingClientRect();
        if(rect.top <= topEdge) currentId = sec.id; else break;
      }
      if(currentId) setActive(currentId);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();`,
        }}
      />
    </Suspense>
  );
}

