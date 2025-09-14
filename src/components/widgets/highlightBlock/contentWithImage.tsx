import { WidgetContext } from '@progress/sitefinity-nextjs-sdk';
import type { HighlightBlockEntity } from './highlightBlock.entity';

import Eyebrow from '../../atoms/eyebrow/eyebrow';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

import { fetchData } from '../../../utils/sitefinity';
import { resolveSitefinitySelection, firstIdFromSelection } from '../../../utils/utils';
import { CmsImage } from '../../../types/type';

type ContentWithImageItem = {
  Id: string;
  Eyebrow?: string;
  Title?: string;
  Description?: string;
  CtaText?: string;
  CtaUrl?: any;
  Image?: any;
};

function imageUrl(img: CmsImage): string | undefined {
  if (!img) return undefined;
  return img.MediaUrl || img.Url || img.ThumbnailUrl || img.EmbedUrl;
}

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
  const description: string | undefined = data.Description;

  const img = Array.isArray(data.Image) ? data.Image[0] : data.Image;
  const imgSrc: string | undefined = imageUrl(img);
  const imgAlt: string = img?.AlternativeText || title || 'illustration';

  return (
    <section className="mx-auto max-w-[1400px] h-[488px] px-[150px] py-7xl">
      <div className="grid grid-cols-2 items-center gap-5 h-full">
        {/* Left: Image */}
        <div className="flex justify-center">
          <div className="relative h-[360px] w-[540px] overflow-hidden rounded-2xl">
            <div
              className="pointer-events-none absolute -top-6 -right-6 h-[120%] w-[120%]
                     rounded-[30px] blur-2xl opacity-30"
            />
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={imgAlt}
                className="h-full w-full object-cover rounded-2xl"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white to-slate-100" />
            )}
          </div>
        </div>

        {/* Right: Text */}
        <div className="text-left space-y-4">
          {eyebrow && <Eyebrow align="left">{eyebrow}</Eyebrow>}

          {title && (
            <Title
              align="left"
              className="font-lufga font-bold text-[40px] leading-[100%] tracking-[-0.8px] align-middle"
            >
              {title}
            </Title>
          )}

          {description && <Description align="left">{description}</Description>}
        </div>
      </div>
    </section>
  );
}

