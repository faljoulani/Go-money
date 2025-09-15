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
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
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
        fields: [
          'Id',
          'Title',
          'UrlName',
          'Description',
          'MainTitle',
          'PageSize',
          'AllowPagination',
          'ItemsToSkip',
          'Files($select=Id,Title,UrlName)',
        ],
      });
    } catch (e) {
      console.error('Error fetching BoardReport item:', e);
    }
  }

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

  const normalizeFiles = (files: any[] = []) =>
    (Array.isArray(files) ? files : []).map((f) => ({
      Id: f?.Id,
      Title: f?.Title,
      UrlName: f?.UrlName,
    }));

  const toInt = (v: any, fallback = 0) =>
    typeof v === 'number' ? v : parseInt(String(v ?? ''), 10) || fallback;

  const toBool = (v: any) =>
    typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true';

  // view model
  const view = {
    Id: item.Id,
    Title: item.Title,
    UrlName: item.UrlName,
    Description: item.Description,
    PageSize: toInt(item.PageSize, 0),
    ItemsToSkip: toInt(item.ItemsToSkip, 0),
    AllowPagination: toBool(item.AllowPagination),
    Years :item.MainTitle.split(',').map((y:string) => y.trim()),
    Files: normalizeFiles(item.Files),
  };

  return (
    <section
      {...attrs}
      className="rounded-[20px] bg-white p-6 md:p-8 border border-slate-200"
    >
      <ReportGridClient
        title={view.Title}
        description={view.Description}
        files={view.Files}
        pageSize={view.PageSize}
        years={view.Years}
        initialOffset={view.ItemsToSkip}
        allowPagination={view.AllowPagination}
      />
    </section>
  );
}

export default BoardReport;