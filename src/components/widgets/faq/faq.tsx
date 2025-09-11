import {
  WidgetContext,
  htmlAttributes,
  RestClientForContext,
} from '@progress/sitefinity-nextjs-sdk';
import QuestionsClient from './QuestionsClient';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { FaqSectionEntity } from './faq.entity';
import Title from '../../atoms/title/title';
import Description from '../../atoms/description/description';
import Eyebrow from '../../atoms/eyebrow/eyebrow';
import React, { useState } from 'react';

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

  type Question = {
    Id: string;
    Title: string;
    Answer?: string;
    Order?: number;
    ParentId?: string;
    ItemDefaultUrl?: string;
  };


  return (
    <section {...attrs}>
      <div className="mx-auto w-full  flex flex-col justify-center items-center gap-2 px-6 pt-12 pb-4">
        {rootData?.Eyebrow && <Eyebrow>{rootData.Eyebrow}</Eyebrow>}
        {rootData?.Title && <Title>{rootData.Title}</Title>}
        {rootData?.Description && <Description>{rootData.Description}</Description>}
      </div>

      {categories.length > 0 && (
        <QuestionsClient
          categories={categories}
        />
      )}
    </section>
  );
}

export default FaqSection;

