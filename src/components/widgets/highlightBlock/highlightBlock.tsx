import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';
import { resolveSitefinitySelection, firstIdFromSelection, linkToHref } from '../../../utils/utils';
import { fetchData, pickImageUrl } from '../../../utils/sitefinity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import ContentWithImage from './contentWithImage';
import ContentWithoutImage from './contentWithoutImage';
import CTA from '../../atoms/cta/cta';

function EmptySafe({ isEdit, label }: { isEdit: boolean; label: string }) {
  return isEdit ? (
    <div className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
      <strong>{label}</strong>
      <div className="mt-1">Open the designer and select an item.</div>
    </div>
  ) : (
    <div />
  );
}

export default async function HighlightBlock(props: WidgetContext<HighlightBlockEntity>) {
  const attrs = htmlAttributes(props);
  const selectedView =
    (props.model as any)?.ViewName ||
    (props.model?.Properties as any)?.ViewName ||
    (props as any)?.viewName ||
    'Default';

  return (
    <section {...attrs} data-view={selectedView}>
      <div data-react-root>
        {selectedView === 'ContentWithImage' ? (
          <ContentWithImage {...props} />
        ) : selectedView === 'ContentWithoutImage' ? (
          <ContentWithoutImage {...props} />
        ) : (
          <HighlightBlockDefault {...props} />
        )}
      </div>
    </section>
  );
}

async function HighlightBlockDefault(props: WidgetContext<HighlightBlockEntity>) {
  const { culture, isEdit } = props.requestContext;
  const dir = culture.startsWith('ar') ? 'rtl' : 'ltr';

  const selection = resolveSitefinitySelection(
    props.model?.Properties?.ExpandBox ?? (props.model?.Properties as any)?.ExpandBox,
  );
  const id = firstIdFromSelection(selection);

  if (!id) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  const fields = [
    'Id',
    'Title',
    'Eyebrow',
    'Description',
    'CtaText',
    'CtaUrl',
    'DarkImage($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText)',
    'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText)',
  ];

  const payload = await fetchData(id ? [id] : [], props.model?.Properties, culture, fields, {
    itemType: selection.Content?.[0]?.Type,
    single: true,
  });

  const data = Array.isArray(payload) ? payload?.[0] : payload;

  if (!data) return <EmptySafe isEdit={isEdit} label="ExpandBox" />;

  const eyebrow: string | undefined = data.Eyebrow;
  const title: string | undefined = data.Title;
  const description: string | undefined = data.Description;
  const ctaText: string | undefined = data.CtaText || 'More details';
  let rawCtaUrl = data.CtaUrl;
  try {
    if (typeof rawCtaUrl === 'string') {
      rawCtaUrl = JSON.parse(rawCtaUrl);
    }
  } catch {}
  const ctaHref = linkToHref(rawCtaUrl);
  const imgSrc: string | undefined = pickImageUrl(
    Array.isArray(data.Image) ? data.Image[0] : data.Image,
  );
  const imgAlt: string =
    (Array.isArray(data.Image) ? data.Image?.[0]?.AlternativeText : data.Image?.AlternativeText) ||
    title ||
    'illustration';
  const darkImgSrc: string | undefined = pickImageUrl(
    Array.isArray(data.DarkImage) ? data.DarkImage[0] : data.DarkImage,
  );
  const darkImgAlt: string =
    (Array.isArray(data.DarkImage)
      ? data.DarkImage?.[0]?.AlternativeText
      : data.DarkImage?.AlternativeText) ||
    title ||
    'illustration';

  return (
    <section className="md:mx-20 relative xs:flex xs:flex-col ">
      {/* Background div that scales */}
      <div className="absolute inset-0 rounded-3xl bg-[#B3DFEF] dark:bg-[#0F0F15]"></div>

      {/* Content above the background */}
      <div
        className="relative md:grid md:grid-cols-2 md:items-center md:py-24 md:pl-16 md:rtl:pr-16 
      md:align-middle md:h-[580px] xs:h-auto xs:py-6 xs:px-4 xs:flex xs:flex-col-reverse"
      >
        {/* Left: copy */}
        <div className="flex flex-col gap-4 max-w-xl xs:mt-6 md:xs:mt-0">
          {eyebrow && <Eyebrow className="dark:text-default text-primary">{eyebrow}</Eyebrow>}
          <Title
            color="text-primary"
            className="
                md:text-5xl md:rtl:text-[40px] xs:text-2xl
                font-bold     
                tracking-[-0.02em]
                md:leading-[63px] md:rtl:leading-[75px] xs:leading-8 xs:rtl:leading-[45px]
              "
          >
            {title}
          </Title>
          {description && (
            <Description
              className="text-default text-base leading-5 rtl:leading-[30px]"
              html={description}
            />
          )}

          {ctaText && (
            <div className="w-full xs:max-w-[285px] md:w-auto xs:mx-auto md:mx-0">
              <CTA
                href={(ctaHref || '').trim() || '#'}
                colorText="text-primaryAlt"
                borderColor="border-primaryAlt"
                bgColor="transparent"
                variant="outline"
                icon="arrow"
                className="xs:w-full md:w-[248px] h-12 md:h-14"
              >
                {ctaText}
              </CTA>
            </div>
          )}
        </div>

        {/* Right: artwork / image panel */}
        <div
          className="xs:flex xs:justify-center md:absolute md:h-[600px] md:w-[490px] md:fadeRight duration-1000 md:right-0 
                     md:ml-[90px] md:rtl:ml-[87px] md:rtl:left-0 md:rtl:right-auto"
        >
          <div className="md:absolute md:h-[600px] md:w-[525px] xs:right-10 rounded-[20px] overflow-hidden">
            {/* Light mode image */}
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                className="block dark:hidden md:h-[600px] md:w-[525px] object-cover xs:h-[300px] xs:w-[300px]"
                draggable={false}
              />
            ) : (
              <div className="block dark:hidden h-[392px] w-[490px] rounded-3xl bg-gradient-to-br from-white to-slate-100" />
            )}

            {/* Dark mode image */}
            {darkImgSrc ? (
              <img
                src={darkImgSrc}
                alt={darkImgAlt}
                className="hidden dark:block md:h-[600px] md:w-[525px] object-cover xs:h-[300px] xs:w-[300px]"
                draggable={false}
              />
            ) : (
              <div className="hidden dark:block h-[392px] w-[490px] rounded-3xl bg-gradient-to-br from-[#1a1a1f] to-[#0f0f15]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

