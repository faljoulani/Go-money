'use server';

import { WidgetContext, htmlAttributes } from '@progress/sitefinity-nextjs-sdk';
import type { ExectiveManagementEntity } from './executiveManagement.entity';
import { fetchData, extractSelectionId } from '../../../utils/sitefinity';
import { resolveSitefinitySelection } from '../../../utils/utils';

import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';

type CmsImage = {
  Url?: string;
  MediaUrl?: string;
  ThumbnailUrl?: string;
  EmbedUrl?: string;
  Title?: string;
  AlternativeText?: string;
  Urls?: string[];
  Provider?: string;
};

type ExecPerson = {
  Id: string;
  Title?: string;
  Position?: string;
  Image?: CmsImage[];
};

type ExecParent = {
  Id: string;
  Title?: string;
  Description?: string;
  RelatedExecutiveManagement?: ExecPerson[];
};

export default async function ExecutiveManagement(props: WidgetContext<ExectiveManagementEntity>) {
  const attributes = htmlAttributes(props);
  const { culture, isEdit } = props.requestContext;

  const selection = resolveSitefinitySelection(
    (props.model?.Properties as any)?.ExecutiveManagements,
  );
  const id = extractSelectionId(selection);

  if (!id) {
    return isEdit ? (
      <section
        {...attributes}
        className="p-6 border border-dashed rounded-lg text-center text-slate-500 "
      >
        <strong>Cards</strong>
        <div className="mt-1">Open the designer and select a Card List.</div>
      </section>
    ) : null;
  }

  const parentFetched = await fetchData(
    [id],
    null,
    culture,
    [
      'Id',
      'Title',
      'Description',
      'RelatedExecutiveManagement(' +
        '$select=Id,Title,Position,' +
        'Image($select=Id,Url,MediaUrl,ThumbnailUrl,EmbedUrl,Title,AlternativeText,Urls,Provider)' +
        ')',
    ],
    {
      itemType: selection?.Content?.[0]?.Type,
      single: true,
    },
  );

  const parent = parentFetched as ExecParent;

  const title = parent?.Title ?? 'Cards';
  const subtitle = parent?.Description ?? '';

  const items = (parent?.RelatedExecutiveManagement ?? []).map((c) => {
    const img = Array.isArray(c?.Image) ? c.Image[0] : c?.Image;
    const iconUrl =
      img?.Url ||
      img?.MediaUrl ||
      img?.ThumbnailUrl ||
      img?.Urls?.[0] ||
      img?.EmbedUrl ||
      undefined;

    return {
      title: c?.Title ?? '',
      description: c?.Position ?? '',
      iconUrl,
    };
  });

  console.log('Executive Management items:', items);

  return (
    <section
      {...attributes}
      className="w-full md:px-20 pt-10 md:pb-10 xs:pb-5 max-w-[1440px] xxl:mx-auto"
    >
      <div className="mb-8">
        <Title className="text-start md:leading-[63px] md:w-[650px] md:text-5xl xs:text-2xl xs:leading-8 font-bold text-primaryAlt">
          {title}
        </Title>
        {subtitle && (
          <Description
            className="text-start mt-1.5 tracking-[-0.02em] xs:leading-5"
            html={subtitle}
          />
        )}
      </div>

      <div className="bg-gradient-to-br from-[#10cebb] to-[#0357ad] dark:from-[#054e42] dark:to-[#010552] rounded-[30px] md:p-16 xs:py-16 xs:px-10 h-auto">
        <div className="grid md:grid-cols-3 xs:grid-cols-1 md:gap-x-10 xs:gap-y-4">
          {/* First 3 items */}
          {items.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="md:flex md:flex-col  items-center">
              {item.iconUrl && (
                <img
                  src={item.iconUrl}
                  alt={item.title}
                  className="rounded-full w-[251px] h-[363px] object-cover xs:mx-auto"
                />
              )}
              <div className="text-center mt-6 space-y-1">
                <h1 className="text-white md:text-[26px] md:leading-8 xs:leading-6  xs:text-lg whitespace-[90%] md:font-bold xs:font-semibold">
                  {item.title}
                </h1>
                <Description
                  html={item.description}
                  className="text-white md:text-[20px] xs:text-base md:font-medium xs:font-normal"
                />
              </div>
            </div>
          ))}

          {/* Last 2 items */}
          <div className="md:col-span-3 md:flex justify-center md:gap-x-10 xs:space-y-4 md:space-y-0 md:mt-14">
            {items.slice(3, 6).map((item: any, i: number) => (
              <div key={i} className="md:flex md:flex-col md:w-[330px]">
                {item.iconUrl && (
                  <img
                    src={item.iconUrl}
                    alt={item.title}
                    className="rounded-full w-[251px] h-[363px] object-cover xs:mx-auto"
                  />
                )}
                <div className="text-center mt-6 space-y-1">
                  <h1 className="text-white md:text-[26px] md:leading-8 xs:leading-6 xs:text-lg whitespace-nowrap md:font-bold xs:font-semibold">
                    {item.title}
                  </h1>
                  <Description
                    html={item.description}
                    className="text-white md:text-[20px] xs:text-base md:font-medium xs:font-normal"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

