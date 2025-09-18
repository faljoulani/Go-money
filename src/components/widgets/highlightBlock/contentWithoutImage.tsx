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
  const ctaHref: string | undefined = linkToHref(data.CtaUrl);

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
              icon="arrow"
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

