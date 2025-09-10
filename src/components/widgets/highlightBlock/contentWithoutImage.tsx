import { WidgetContext } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';
import { fetchData } from '../../../utils/sitefinity';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

type CmsLink = { Href?: string; OpenInNewTab?: boolean } | string | null | undefined;

function parseSelection(raw: unknown) {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
  return raw as any;
}
function firstIdFromSelection(sel: any) {
  if (!sel) return undefined;
  if (sel.Id) return sel.Id;
  const ids = sel?.CardListData?.ItemIdsOrdered ?? sel?.ItemIdsOrdered;
  if (Array.isArray(ids) && ids.length) return ids[0];
  const maybeContentId = sel?.Content?.[0]?.Variations?.[0]?.Filter?.Value?.split(',')?.[0];
  return maybeContentId || undefined;
}
function linkToHref(link: CmsLink): string | undefined {
  if (!link) return undefined;
  if (typeof link === 'string') return link;
  const any = link as any;
  return Array.isArray(any) ? (typeof any[0] === 'string' ? any[0] : any[0]?.Href) : any?.Href;
}

export default async function WithoutImage(props: WidgetContext<HighlightBlockEntity>) {
  const { culture, isEdit } = props.requestContext;

  const selection = parseSelection(
    props.model?.Properties?.ExpandBox ?? (props.model?.Properties as any)?.ExpandBox,
  );
  const id = firstIdFromSelection(selection);

  if (!id) {
    return isEdit ? (
      <div className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
        <strong>Centered CTA</strong>
        <div className="mt-1">Open the designer and select an ExpandBox item.</div>
      </div>
    ) : (
      <div />
    );
  }

  const itemType = 'Telerik.Sitefinity.DynamicTypes.Model.ExpandBox.ExpandBox';
  const fields = ['Id', 'Eyebrow', 'Title', 'Description', 'CtaText', 'CtaUrl'];
  const raw = await fetchData([id], null, culture, fields, { itemType, single: true });
  const item = (Array.isArray(raw) ? raw[0] : raw) as any;
  if (!item)
    return isEdit ? (
      <div className="p-6 border border-dashed rounded-2xl text-center">Item not found.</div>
    ) : (
      <div />
    );

  const eyebrow: string | undefined = item.Eyebrow;
  const title: string | undefined = item.Title;
  const description: string | undefined = item.Description;
  const ctaText: string | undefined = item.CtaText || '';
  const ctaHref: string | undefined = linkToHref(item.CtaUrl);

  return (
    <div className="mx-auto w-full bg-[#EEEEEE]">
      <div className="mx-auto max-w-[1400px] h-[244px] sm:h-[300px] md:h-[356px] lg:h-[420px] xl:h-[488px] px-[24px] sm:px-[48px] md:px-[96px] lg:px-[150px] py-7xl flex flex-col items-center justify-center text-center space-y-6">
        {/* Title */}
        {title ? (
          <h2 className="font-lufga font-bold text-[32px] sm:text-[36px] md:text-[40px] leading-[100%] tracking-[-0.8px] text-[#010663] inline-flex items-center gap-2">
            {title}
          </h2>
        ) : null}

        {/* Description */}
        <div className="max-w-[720px] text-[#424242]">
          {description ? (
            <Description
              align="center"
              className="font-poppins font-normal text-[18px] leading-[30px] tracking-[0px] text-center
               text-[hsla(0,0%,26%,1)] w-[400px] h-[60px] mx-auto"
            >
              {description}
            </Description>
          ) : null}
        </div>

        {/* CTA */}
        {ctaText ? (
          <div className="pt-2">
            <CTA
              href={ctaHref}
              arrow={false}
              className="bg-[hsla(237,98%,20%,1)] text-white font-poppins font-extralight"
            >
              {ctaText}
            </CTA>
          </div>
        ) : null}
      </div>
    </div>
  );
}

