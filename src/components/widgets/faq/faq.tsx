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
  const viewName = model?.ViewName || 'Default';

  const parseContent = (c: any) => (typeof c === 'string' ? JSON.parse(c) : c);
  const faqRoot = parseContent(model?.FaqRoot);
  const selectedCategories = parseContent(model?.FaqCategories);
  console.log('CATEGORIES:', selectedCategories);
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
    console.error('Error loading FAQ THIS data:', e);
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

  async function fetchToken(): Promise<string> {
    const url = 'http://dev-sfall.ddns.net:9095/sitefinity/oauth/token';

    const body = new URLSearchParams({
      username: 'hamzeh.allyan@ejada.com',
      password: 'hamzeh123456',
      grant_type: 'password',
      client_id: 'postman',
      client_secret: 'secret',
    }).toString();

   
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-sf-service-request': 'true',
      },
      body,
      cache: 'no-store',
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Token error ${resp.status} ${resp.statusText} — ${text}`);
    }

    const json = (await resp.json()) as {
      access_token: string;
      token_type?: string;
      expires_in?: number;
      scope?: string;
    };

    if (!json?.access_token) {
      throw new Error('Token response did not include access_token.');
    }

    return json.access_token;
  }

  const SF_API_BEARER = await fetchToken();
  async function fetchQuestions(
    props: any,
  ): Promise<{ questions: Question[]; grouped: Record<string, Question[]> }> {
    const origin = (process.env.SF_BASE_URL ?? '').replace(/\/$/, '');
    if (!origin)
      throw new Error('SF_BASE_URL env var is required (e.g., http://dev-sfall.ddns.net:9095)');

    const select = '$select=Id,Title,Answer,Order,ParentId,ItemDefaultUrl';
    const orderby = '$orderby=Order asc, Title asc';
    const url = `${origin}/api/default/faqquestions`;

    const token = (SF_API_BEARER || '').trim();
    if (!token) throw new Error('SF_API_BEARER env var is missing');

    const headers: Record<string, string> = {
      Accept: 'application/json;odata.metadata=minimal',
      Authorization: `Bearer ${token}`,
      'x-sf-service-request': 'true',
    };

    console.log('URL:', url);
    console.log('BEARER:', SF_API_BEARER);
    const resp = await fetch(url, {
      headers,
    });

    console.log('WWW-Authenticate:', resp.headers.get('www-authenticate'));

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`FAQ GET ${resp.status} ${resp.statusText} — ${text}`);
    }

    const data = (await resp.json()) as { value?: Question[] };
    const questions = data?.value ?? [];

    const grouped: Record<string, Question[]> = {};
    for (const q of questions) {
      const key = (q.ParentId ?? '').toLowerCase();
      (grouped[key] ??= []).push(q);
    }
    for (const k of Object.keys(grouped)) {
      grouped[k].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0) || a.Title.localeCompare(b.Title));
    }

    return { questions, grouped };
  }

  let questions: Question[] = [];
  let grouped: Record<string, Question[]> = {};

  try {
    const res = await fetchQuestions(props);
    questions = res.questions;
    grouped = res.grouped;
  } catch (e) {
    console.error('[FAQ] questions fetch failed:', e);
  }

  return (
    <section {...attrs} className={`FaqSection FaqSection-${viewName}`}>
      <div className="mx-auto w-full  flex flex-col justify-center items-center gap-2 px-6 pt-12 pb-4">
        {rootData?.Eyebrow && <Eyebrow>{rootData.Eyebrow}</Eyebrow>}
        {rootData?.Title && <Title>{rootData.Title}</Title>}
        {rootData?.Description && <Description>{rootData.Description}</Description>}
      </div>

      {/* categories + questions (client island handles selection) */}
      {categories.length > 0 && (
        <QuestionsClient
          categories={categories}
          // grouped={
          //   // normalize keys to lower for match with ParentId
          //   Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k.toLowerCase(), v]))
          // }
        />
      )}
    </section>
  );
}

export default FaqSection;

