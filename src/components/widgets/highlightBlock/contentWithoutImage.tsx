import { WidgetContext } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';
import { fetchData } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, firstIdFromSelection, linkToHref } from '../../../utils/utils';
import Description from '../../atoms/description/description';
import CTA from '../../atoms/cta/cta';

export default async function WithoutImage(props: WidgetContext<HighlightBlockEntity>) {
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection(
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

  const fields = ['Id', 'Eyebrow', 'Title', 'Description', 'CtaText', 'CtaUrl'];
  const paylaod = await fetchData([id], null, culture, fields, {
    itemType: selection.Content?.[0]?.Type,
    single: true,
  });

  const data = (Array.isArray(paylaod) ? paylaod[0] : paylaod) as any;
  if (!data)
    return isEdit ? (
      <div className="p-6 border border-dashed rounded-2xl text-center">Item not found.</div>
    ) : (
      <div />
    );

  const title: string | undefined = data.Title;
  const description: string | undefined = data.Description;
  const ctaText: string | undefined = data.CtaText || '';
  let rawCtaUrl = data.CtaUrl;
  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {
  }
  
  const ctaHref: string | undefined = linkToHref(rawCtaUrl);
  console.log('------------>', ctaHref )
  return (
    <div className="mx-auto w-full h-auto">
      <div className="mx-auto max-w-[1400px] md:h-[266px] xs:h-[241px] md:px-6 xs:px-4 md:pt-16 xs:pt-10 flex flex-col items-center justify-center text-center space-y-4">
        {/* Title */}
        {title ? (
          <h2 className="font-semibold md:text-[52px] xs:text-2xl md:leading-[62px] xs:leading-8 tracking-[-0.02em] text-primary inline-flex items-center gap-2">
            {title}
          </h2>
        ) : null}

        {/* Description */}
        <div className="md:max-w-[720px] text-[#424242]">
          {description ? (
            <Description
              html={description}
              className="text-[18px] leading-[30px] tracking-[0px] text-center
               text-default md:w-[400px] mx-auto"
            />
          ) : null}
        </div>

        {/* CTA */}
        {ctaText ? (
          <div>
            <CTA href={(ctaHref || '').trim() || '#'} variant="solid" className="bg-primary text-white font-medium leading-snug px-[76px] rounded-[18px]">
              {ctaText}
            </CTA>
          </div>
        ) : null}
      </div>
    </div>
  );
}

