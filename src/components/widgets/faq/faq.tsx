import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import QuestionsClient from './faqClient';
import { FaqSectionEntity } from './faq.entity';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import React from 'react';
import { resolveSitefinitySelection } from '../../../utils/utils';
import { extractSelectionId } from '../../../utils/sitefinity';

const FAQ_ROOT_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FAQS';
const FAQ_CATEGORY_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FaqCategory';

export async function FaqSection(props: WidgetContext<FaqSectionEntity>) {
  const attrs = htmlAttributes(props);
  const model = props.model?.Properties;
  const { isEdit } = props.requestContext;
  const lang = props.requestContext.culture || 'en';
  const faqRoot = resolveSitefinitySelection(model?.FaqRoot);
  const selectedCategories = resolveSitefinitySelection(model?.FaqCategories);

  let rootData: any = undefined;
  let categories: Array<{ Id: string; Title: string; Order?: number }> = [];

  const id = extractSelectionId(faqRoot);

  if (!id) {
    return isEdit ? (
      <section
        {...attrs}
        className="p-6 border border-dashed rounded-2xl text-center text-slate-500"
      >
        <strong>Select a FAQ</strong>
        <div className="mt-1">Open the designer and select an item.</div>
      </section>
    ) : null;
  }

  try {
    if (faqRoot?.Content?.length) {
      const rootRes = await RestClientForContext.getItems(faqRoot, {
        type: FAQ_ROOT_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Description', 'Eyebrow'],
      });
      rootData = rootRes?.Items?.[0];
    }

    if (selectedCategories?.Content?.length) {
      const catRes = await RestClientForContext.getItems(selectedCategories, {
        type: FAQ_CATEGORY_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Order'],
      });
      categories = (catRes?.Items ?? [])
        .map((item: any) => ({
          Id: item.Id,
          Title: item.Title,
          Order: item.Order,
        }))
        .sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
    }
  } catch (e) {
    return <section {...attrs}>Error loading data</section>;
  }

  if (!categories.length && props.requestContext.isEdit) {
    return <section {...attrs}>No Category</section>;
  }
  return (
    <section {...attrs}>
      <div className="md:mx-auto w-full flex flex-col gap-2 text-center justify-center xs:mt-4 items-center md:px-6 md:pt-12 md:pb-4 fadeupText">
        {rootData?.Eyebrow && <Eyebrow>{rootData.Eyebrow}</Eyebrow>}
        {rootData?.Title && (
          <Title
            className="
                      md:text-[48px]    
                      xs:text-[28px]
                      tracking-[-0.02em]
                      font-bold
                      md:leading-[63px]
                      xs:leading-[30px]
                    "
          >
            {rootData.Title}
          </Title>
        )}

        {rootData?.Description && (
          <Description>{rootData.Description}</Description>
        )}
      </div>

      {categories.length > 0 && <QuestionsClient lang={lang} categories={categories} />}
    </section>
  );
}

export default FaqSection;

