import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import QuestionsClient from './QuestionsClient';
import { FaqSectionEntity } from './faq.entity';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import React from 'react';

const FAQ_ROOT_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FAQS';
const FAQ_CATEGORY_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.FAQs.FaqCategory';

export async function FaqSection(props: WidgetContext<FaqSectionEntity>) {
  const attrs = htmlAttributes(props);
  const model = props.model?.Properties;

  const parseContent = (c: any) => (typeof c === 'string' ? JSON.parse(c) : c);
  const faqRoot = parseContent(model?.FaqRoot);
  const selectedCategories = parseContent(model?.FaqCategories);

  let rootData: any = undefined;
  let categories: Array<{ Id: string; Title: string; Order?: number }> = [];

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
      <div className="mx-auto w-full flex flex-col gap-2 text-center justify-center items-center px-6 pt-12 pb-4 fadeup">
        {rootData?.Eyebrow && <Eyebrow>{rootData.Eyebrow}</Eyebrow>}
        {rootData?.Title && (
          <Title
            className="
                      text-5xl
                      font-bold     
                      tracking-tight
                      leading-[100%]
                    "
          >
            {rootData.Title}
          </Title>
        )}

        {rootData?.Description && (
          <Description className="font-extralight">{rootData.Description}</Description>
        )}
      </div>

      {categories.length > 0 && <QuestionsClient categories={categories} />}
    </section>
  );
}

export default FaqSection;

