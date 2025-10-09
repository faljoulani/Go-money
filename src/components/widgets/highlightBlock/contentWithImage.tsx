import { WidgetContext } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

import { fetchData, pickImageUrl } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, firstIdFromSelection } from '../../../utils/utils';
import { CmsImage } from '../../../types/typee';

type ContentWithImageItem = {
  Id: string;
  Eyebrow?: string;
  Title?: string;
  Subtitle?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: any;
  Image?: any;
};

export default async function ContentWithImage(props: WidgetContext<HighlightBlockEntity>) {
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection((props.model?.Properties as any)?.ExpandBox);

  const id = firstIdFromSelection(selection);

  if (!id) {
    return isEdit ? (
      <section className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
        <strong>ContentWithImage</strong>
        <div className="mt-1">Open the designer and select a content item.</div>
      </section>
    ) : (
      <div />
    );
  }

  const fields = [
    'Id',
    'Eyebrow',
    'Title',
    'Subtitle',
    'Description',
    'CtaText',
    'CtaUrl',
    'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText)',
  ];

  const payload = await fetchData([id], null, culture, fields, {
    itemType: selection.Content?.[0]?.Type,
    single: true,
  });

  const data = (Array.isArray(payload) ? payload[0] : payload) as ContentWithImageItem | null;

  if (!data)
    return isEdit ? (
      <section className="p-6 border border-dashed rounded-2xl text-center text-slate-500">
        No item found.
      </section>
    ) : (
      <div />
    );

  const eyebrow: string | undefined = data.Eyebrow;
  const title: string | undefined = data.Title;
  const subtitle: string | undefined = data.Subtitle;
  const description: string | undefined = data.Description;

  const img = Array.isArray(data.Image) ? data.Image[0] : data.Image;
  const imgSrc: string | undefined = pickImageUrl(img);
  const imgAlt: string = img?.AlternativeText || title || 'illustration';

  return (
    <section className="mx-auto md:w-[1400px] h-auto md:px-[150px] xs:px-0 md:py-16 xs:py-10 xs:w-[343px]">
      <div className="grid md:grid-cols-2 items-center gap-5 h-full xs:grid-cols-1">
        {/* Left: Image */}
        <div className="flex justify-center">
          <div className="relative md:h-[360px] xs:h-[228px] md:w-[540px] xs:w-[343px] overflow-hidden rounded-2xl">
            <div
              className="pointer-events-none absolute -top-6 -right-6 xs:h-[228px] md:h-[360px] w-[540px]
                     rounded-[30px] blur-2xl opacity-30"
            />
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                className="object-cover rounded-2xl xs:w-[333px] md:w-[540px]"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white to-slate-100" />
            )}
          </div>
        </div>

        {/* Right: Text */}
        <div className="text-left space-y-3 rtl:text-right">
          {eyebrow && <Eyebrow className="md:text-lg xs:text-14px md:font-medium xs:font-normal md:leading-6 xs:leading-[18px]">{eyebrow}</Eyebrow>}

          {title && (
            <Title className="font-bold md:text-[40px] xs:text-[24px] md:leading-[52px] xs:leading-8 tracking-[-0.02em] align-middle">
              {title}
            </Title>
          )}
          {subtitle && <Description className='md:font-semibold xs:font-bold md:leading-6 xs:leading-5' html={subtitle} />}
          {description && <Description className='leading-5' html={description} />}
        </div>
      </div>
    </section>
  );
}

