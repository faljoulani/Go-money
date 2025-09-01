import { WidgetContext, htmlAttributes, RestClientForContext } from '@progress/sitefinity-nextjs-sdk';
import { BoardReportEntity } from './BoardReport.entity';

const BOARD_REPORT_TYPE = 'Telerik.Sitefinity.DynamicTypes.Model.BoardReports.BoardReport';

export async function BoardReport(props: WidgetContext<BoardReportEntity>) {
  const attrs = htmlAttributes(props);

  // read designer selection (MixedContent)
  let selection = props.model?.Properties?.BoardReport ?? (props.model?.Properties as any)?.BoardReport;
  if (typeof selection === 'string') {
    try { selection = JSON.parse(selection); } catch { selection = undefined; }
  }

  let item: any;
  if (selection?.Content?.length) {
    try {
      item = await RestClientForContext.getItem(selection, {
        type: BOARD_REPORT_TYPE,
        culture: props.requestContext.culture,
        traceContext: props.traceContext,
        fields: [
          // Root fields
          'Id',
          'Title',
          'UrlName',
          'Description',
          'MainTitle',
          'PageSize',         // NEW name
          'AllowPagination',  // NEW name
          'ItemsToSkip',      // NEW name

          // Related data
          'Files($select=Id,Title,UrlName)',
        ],
      });
    } catch (e) {
      console.error('Error fetching BoardReport item:', e);
    }
  }

  if (!item) {
    if (props.requestContext.isEdit) {
      return <section {...attrs} className="BoardReport-widget">Select a “Board report” item.</section>;
    }
    return null;
  }

  // helpers
  const normalizeFiles = (files: any[] = []) =>
    (Array.isArray(files) ? files : []).map(f => ({
      Id: f?.Id,
      Title: f?.Title,
      UrlName: f?.UrlName,
    }));

  const toInt = (v: any, fallback = 0) =>
    typeof v === 'number' ? v : (parseInt(String(v ?? ''), 10) || fallback);

  const toBool = (v: any) => (typeof v === 'boolean' ? v : String(v ?? '').toLowerCase() === 'true');

  // view model
  const view = {
    Id: item.Id,
    Title: item.Title,
    UrlName: item.UrlName,
    Description: item.Description,
    MainTitle: item.MainTitle,
    PageSize: toInt(item.PageSize, 0),
    ItemsToSkip: toInt(item.ItemsToSkip, 0),
    AllowPagination: toBool(item.AllowPagination),
    Files: normalizeFiles(item.Files),
  };

  // (optional) example of applying the paging to Files locally
  const visibleFiles = view.AllowPagination && view.PageSize > 0
    ? view.Files.slice(view.ItemsToSkip, view.ItemsToSkip + view.PageSize)
    : view.Files;

  return (
    <section {...attrs} className="BoardReport-debug">
      <h2>Board Report Debug</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#f9f9f9', padding: 10 }}>
        {JSON.stringify(view, null, 2)}
      </pre>

      {/* Example rendering using the applied paging */}
      <div style={{ marginTop: 8 }}>
        <strong>Rendered files ({visibleFiles.length} of {view.Files.length}):</strong>
        <ul>
          {visibleFiles.map(f => <li key={f.Id}>{f.Title}</li>)}
        </ul>
        {view.AllowPagination && view.PageSize > 0 && (
          <small>Offset (ItemsToSkip): {view.ItemsToSkip} • Page size: {view.PageSize}</small>
        )}
      </div>
    </section>
  );
}

export default BoardReport;
