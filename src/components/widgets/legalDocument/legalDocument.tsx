import React from 'react';
import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
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

  if (!legalDocSel?.Content?.length) {
    return (
      <div {...attrs}>
        <div className="rounded-xl border  bg-amber-50 p-4 text-sm ">Pick a Legal document.</div>
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
      <div className="sf-ldoc md:mt-16 xs:my-10 max-w-[1440px] xxl:mx-auto">
        <div className="mx-auto md:grid md:gap-8 md:grid-cols-[360px_1fr]">
          <aside
            className="self-start sticky md:top-24 xs:top-[77px] bg-white dark:bg-[#1d1d28] 
          md:rounded-[15px] xs:rounded-xl xs:p-2 md:p-0 xs:mb-6 md:mb-0 xs:h-16 md:h-auto z-[50]"
          >
            <nav className="md:rounded-[15px] xs:rounded-xl">
              <ul
                className="  md:rounded-[15px] xs:rounded-xl flex md:flex-col xs:flex-row xs:overflow-x-auto 
              snap-x snap-mandatory no-scrollbar"
              >
                {sections.map((s, i) => {
                  const slug = slugify(s.SectionHeader || `section-${i + 1}`);

                  const cleanHeader = s.SectionHeader?.replace(/^\d+[\.\-\s]+/, '') || '';

                  return (
                    <li
                      key={s.Id}
                      className="border-b transition border-white/10 snap-center flex-shrink-0"
                    >
                      <a
                        suppressHydrationWarning
                        className={`sf-ldoc__link xs:rounded-xl flex items-center justify-between px-6 py-5 
          xs:h-12 md:h-16 text-[15px] border-b transition last:border-b-0 border-white/10`}
                        href={`#${slug}`}
                        data-target={slug}
                        data-index={i + 1}
                      >
                        <span className="truncate">{cleanHeader}</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-[24px] h-[24px] rtl:rotate-180 xs:hidden md:block"
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
          <main className="md:min-h-[320px] rounded-2xl bg-white dark:bg-[#1d1d28] p-4 md:p-7 z-10">
            {sections.map((s, i) => {
              const slug = slugify(s.SectionHeader || `section-${i + 1}`);
              return (
                <section
                  key={s.Id}
                  id={slug}
                  className="sf-ldoc__section scroll-mt-[var(--ldoc-offset,0px)] py-4"
                  data-index={i + 1}
                >
                  <h4 className="mb-3 text-xl font-bold leading-6 text-primary">
                    {s.SectionHeader}
                  </h4>
                  <div
                    className="descriptionHtml"
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

