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

  type Question = {
    Id: string;
    Title: string;
    Answer?: string;
    Order?: number;
    ParentId?: string;
    ItemDefaultUrl?: string;
  };

  // async function fetchToken(): Promise<any> {
  //   const url = 'http://dev-sfall.ddns.net:9095/sitefinity/oauth/token';

  //   const myHeaders = new Headers();
  //   myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  //   const urlencoded = new URLSearchParams();
  //   urlencoded.append('username', 'hamzeh.alyyan@ejada.com');
  //   urlencoded.append('password', 'hamzeh123456');
  //   urlencoded.append('grant_type', 'password');
  //   urlencoded.append('client_id', 'postman');
  //   urlencoded.append('client_secret', 'secret');

  //   const requestOptions = {
  //     method: 'POST',
  //     headers: myHeaders,
  //     body: urlencoded,
  //     redirect: 'follow' as RequestRedirect,
  //   };

  //   const response = await fetch(url, requestOptions);
  //   const result = await response.json();
  //   return result.access_token;
  // }

  // const SF_API_BEARER = await fetchToken();

  // async function fetchQuestions(): Promise<{ questions: Question[]; grouped: Record<string, Question[]> }>{
  //   const origin = (process.env.SF_BASE_URL ?? '').replace(/\/$/, '');
  //   if (!origin)
  //     throw new Error('SF_BASE_URL env var is required (e.g., http://dev-sfall.ddns.net:9095)');

  //   const select = '$select=Id,Title,Answer,Order,ParentId,ItemDefaultUrl';
  //   const orderby = '$orderby=Order asc, Title asc';
  //   const url = `${origin}/api/default/faqquestions?${select}&${orderby}`;

  //   const token = SF_API_BEARER;

  //   if (!token) throw new Error('SF_API_BEARER env var is missing');

  //   const myHeaders = new Headers();
  //   myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
  //   myHeaders.append('Authorization', `Bearer ${token}`);

  //   const response = await fetch(url, { headers: myHeaders });
  //   // const result = await response.text();

  //   const data = (await response.json()) as {value?:Question[]};
  //   const questions = data?.value ?? [];

  //   const grouped: Record<string,Question[]>={};

  //   for (const question of questions){
  //     const key = (question.ParentId || '').toLowerCase();
  //     (grouped[key] ??=[]).push(question);
  //   }
  //   for (const k of Object.keys(grouped)){
  //     grouped[k].sort(
  //       (a,b)=>(a.Order ?? 0 )- (b.Order ?? 0) || a.Title.localeCompare(b.Title)
  //     );
  //   }
  //   return {questions, grouped};

  // }

  // let questions: Question[] = [];
  // let grouped: Record<string, Question[]> = {};

  // try {
  //   const res = await fetchQuestions();
  //   grouped = res.grouped;
  // } catch (e) {
  //   console.error('[FAQ] questions fetch failed:', e);
  // }

  //  const groupedLower = Object.fromEntries(
  //     Object.entries(grouped).map(([k, v]) => [k.toLowerCase(), v]),
  //   );
  return (
    <section {...attrs}>
      <div className="mx-auto w-full  flex flex-col justify-center items-center gap-2 px-6 pt-12 pb-4 fadeup">
        {rootData?.Eyebrow && <Eyebrow>{rootData.Eyebrow}</Eyebrow>}
        {rootData?.Title && <Title>{rootData.Title}</Title>}
        {rootData?.Description && (
          <Description className="font-extralight">{rootData.Description}</Description>
        )}
      </div>

      {categories.length > 0 && <QuestionsClient categories={categories} />}
    </section>
  );
}

export default FaqSection;

