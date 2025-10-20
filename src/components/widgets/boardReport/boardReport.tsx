import {
  WidgetContext,
  htmlAttributes,
} from '@progress/sitefinity-nextjs-sdk';
import { RestClient } from '@progress/sitefinity-nextjs-sdk/rest-sdk';
import { BoardReportEntity } from './boardReport.entity';
import ReportGridClient from './reportGridClient';
import React from 'react';

const BOARD_REPORT_TYPE =
  'Telerik.Sitefinity.DynamicTypes.Model.BoardReports.BoardReport';

export async function BoardReport(props: WidgetContext<BoardReportEntity>) {
  const attrs = htmlAttributes(props);
  let selection =
    props.model?.Properties?.BoardReport ??
    (props.model?.Properties as any)?.BoardReport;

  if (typeof selection === 'string') {
    try {
      selection = JSON.parse(selection);
    } catch {
      selection = undefined;
    }
  }

  let item: any;
  if (selection?.Content?.length) {
    const id = selection?.ItemIdsOrdered?.[0]?.toString();
    const provider = selection?.Content?.[0]?.Variations?.[0]?.Source?.toString();

    try {
      item = await RestClient.getItem({
        id,
        provider,
        type: BOARD_REPORT_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: ['Id', 'Title', 'Description', 'MainTitle', 'AllowPagination'],
      });
    } catch (e) {
      console.error('Error fetching BoardReport item:', e);
    }
  }

  const lang = props.requestContext.culture || 'en';
  if (!item) {
    if (props.requestContext.isEdit) {
      return (
        <section {...attrs} className="p-6 rounded-xl border border-dashed">
          Select a “Board report” item.
        </section>
      );
    }
    return null;
  }

  const years = String(item.MainTitle || '')
    .split(',')
    .map((y: string) => y.trim())
    .filter(Boolean);

  return (
    <section {...attrs} className="md:px-20 xs:px-4 rounded-[32px]">
      <ReportGridClient
        lang={lang}
        id={item.Id}
        title={item.Title}
        description={item.Description}
        years={years}
        allowPagination={item.AllowPagination}
      />
    </section>
  );
}

export default BoardReport;
