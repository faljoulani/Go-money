import React, { Suspense } from 'react';
import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import type { LegalDocumentEntity, LegalSection } from './legalDocument.entity';
import { resolveSitefinitySelection } from '../../../utils/utils';
import ScriptForLegalDocument from './legalDoc.client';
const LEGAL_DOC_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Legaldocument';
const SECTIONS_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.LegalDocument.Sections';

function normalizeItems(res: any) {
  return Array.isArray(res?.Items)
    ? res.Items
    : Array.isArray(res?.value)
      ? res.value
      : Array.isArray(res)
        ? res
        : [];
}

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
  const culture = props.requestContext?.culture;
  const traceContext = props.traceContext;

  const legalDocSel = resolveSitefinitySelection(model?.LegalDocRoot);
  const sectionsSel = resolveSitefinitySelection(model?.SectionsSelection);

  console.log('legalDocSel', legalDocSel);
  console.log('sectionsSel', sectionsSel);
  if (!legalDocSel?.Content?.length) {
    return (
      <div {...attrs}>
        <div className="rounded-xl border  bg-amber-50 p-4 text-sm ">
          Pick a Legal document (root).
        </div>
      </div>
    );
  }

  let doc: { Id: string; Title: string } | null = null;
  let sections: LegalSection[] = [];

  try {
    let id = legalDocSel?.ItemIdsOrdered?.[0]?.toString();
    let provider = legalDocSel?.Content?.[0]?.Variations?.[0]?.Source?.toString();
    const docRes = await RestClient.getItem({
      id,
      provider,
      type: LEGAL_DOC_TYPE,
      culture,
      traceContext,
      fields: ['Id', 'Title'],
    });
    doc = {
      Id: docRes.Id,
      Title: docRes.Title ?? '',
    };

    console.log('sfdasdafdasdf', doc?.Id);
    if (sectionsSel?.Content?.length) {
      const res = await RestClient.getItems({
        type: SECTIONS_TYPE,
        culture,
        traceContext,
        fields: ['Id', 'SectionHeader', 'Description', 'Order', 'ParentId'],
      });
      sections = normalizeItems(res)
        .filter((s: any) => s.ParentId === doc.Id)
        .sort((a: any, b: any) => (a.Order ?? 0) - (b.Order ?? 0));
    } else {
      const res = await RestClient.getItems({
        type: SECTIONS_TYPE,
        culture,
        traceContext,
        fields: ['Id', 'SectionHeader', 'Description', 'Order', 'ParentId'],
      });
      sections = normalizeItems(res);
    }
  } catch (e: any) {
    console.error('LegalDocument fetch failed:', {
      message: e?.message,
      code: e?.code,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data,
    });
    return (
      <div {...attrs} className="rounded-xl border  p-4 text-sm">
        Failed to load Legal Document.{' '}
        {e?.response?.status ? `(${e.response.status} ${e.response.statusText})` : e?.message}
      </div>
    );
  }

  if (!doc) {
    return (
      <div {...attrs} className="rounded-xl border p-4 text-sm">
        Select a LegalDocument item in the designer.
      </div>
    );
  }
  const offset = 0;

  return (
    <div {...attrs}>
      <div className="sf-ldoc mt-20">
        <div className="mx-auto grid gap-6 md:grid-cols-[320px_1fr]">
          <aside className="self-start md:sticky md:top-6 bg-white rounded-3xl">
            <nav className="rounded-3xl  shadow-lg">
              <ul className="rounded-3xl overflow-hidden  ">
                {sections.map((s, i) => {
                  const slug = slugify(s.SectionHeader || `section-${i + 1}`);
                  return (
                    <li key={s.Id} className="border-b transition last:border-b-0 border-white/10">
                      <a
                        className={`sf-ldoc__link flex items-center justify-between px-6 py-5 text-[15px] border-b transition last:border-b-0 border-white/10`}
                        href={`#${slug}`}
                        data-target={slug}
                        data-index={i + 1}
                      >
                        <span className="truncate">{s.SectionHeader}</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-[24px] h-[24px] rtl:rotate-180"
                        >
                          <line x1="0" y1="12" x2="15" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
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
                  <h4 className="mb-3 text-[20px] font-extrabold leading-snug text-[#010663]">
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

// function ScriptForLegalDocument({ offset }: { offset: number }) {
//   return (
//     <Suspense>
//       <script
//         dangerouslySetInnerHTML={{
//           __html: `(function(){

//   const links = Array.from(document.querySelectorAll('.sf-ldoc__link'));
//   const sections = Array.from(document.querySelectorAll('.sf-ldoc__section'));

//   // Smooth scroll
//   links.forEach(a=>{
//     a.addEventListener('click', function(e){
//       const id = this.getAttribute('data-target');
//       const el = document.getElementById(id);
//       if(!el) return;
//       e.preventDefault();
//       const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
//       window.scrollTo({ top: y, behavior: 'smooth' });
//       history.replaceState(null,'','#'+id);
//     });
//   });

//   function setActive(id){
//     // remove Tailwind utility classes first
//     links.forEach(l=>{
//       l.classList.remove('active','bg-[#010663]','text-white','ring-1','ring-slate-900');
//     });
//     const to = links.find(l=>l.getAttribute('data-target')===id);
//     if(to){
//       // add Tailwind classes only
//       to.classList.add('active','bg-[#010663]','text-white','ring-1','ring-slate-900');
//     }
//   }

//   if(location.hash){
//     const id = location.hash.replace('#','');
//     setActive(id);
//   }

//   let ticking = false;
//   function onScroll(){
//     if(ticking) return;
//     ticking = true;
//     requestAnimationFrame(()=>{
//       const topEdge = OFFSET + 1;
//       let currentId = sections[0]?.id;
//       for(const sec of sections){
//         const rect = sec.getBoundingClientRect();
//         if(rect.top <= topEdge) currentId = sec.id; else break;
//       }
//       if(currentId) setActive(currentId);
//       ticking = false;
//     });
//   }
//   window.addEventListener('scroll', onScroll, { passive: true });
//   window.addEventListener('resize', onScroll);
//   onScroll();
// })();`,
//         }}
//       />
//     </Suspense>
//   );
// }

