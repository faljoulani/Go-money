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

  return (
    <section className="md:mx-20 relative xs:flex xs:flex-col xs:mx-2">
      {/* Background div that scales */}
      <div className="absolute inset-0 rounded-3xl bg-skyTint"></div>

      {/* Content above the background */}
      <div className="relative md:grid md:grid-cols-2 md:items-center md:py-24 md:pl-16 md:rtl:pr-16 md:align-middle md:h-[580px] xs:h-[700px]   xs:py-16 xs:px-6 xs:flex xs:flex-col-reverse">
        {/* Left: copy */}
        <div className="flex flex-col gap-5 max-w-xl ">
          {eyebrow && <Eyebrow className="text-default">{eyebrow}</Eyebrow>}
          <Title
            color="text-black"
            className="
                text-5xl
                font-bold     
                tracking-tight
                leading-[100%]
              "
          >
            {title}
          </Title>
          {description && <Description className="text-default text-base" html={description} />}

          {ctaText && (
            <div>
              <CTA
                href={(ctaHref || '').trim() || '#'}
                colorText="text-textPrimaryAlt"
                borderColor="border-primary"
                bgColor="transparent"
                variant="outline"
                icon="arrow"
                className="w-[248px] h-14"
              >
                {ctaText}
              </CTA>
            </div>
          )}
        </div>

        {/* Right: artwork / image panel */}
        <div className="md:absolute md:h-[392px] md:w-[490px] md:fadeRight duration-1000 md:right-0 md:mr-[87px] md:rtl:ml-[87px] md:rtl:left-0 md:rtl:right-auto">
          <div className="md:absolute md:h-[392px]  md:w-[490px] xs:right-10  rounded-[20px] overflow-hidden">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                className="md:h-[392px] md:w-[490px] object-contain rounded-[20px] xs:h-[250px] xs:w-[250px] xs:mr-[40px] xs:ml-[20px]"
                draggable={false}
              />
            ) : (
              <div className="h-[392px] w-[490px] rounded-3xl bg-gradient-to-br from-white to-slate-100" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

