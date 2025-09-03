import {
  WidgetEntity,
} from '@progress/sitefinity-widget-designers-sdk/decorators/widget-entity';
import { ContentSection } from '@progress/sitefinity-widget-designers-sdk/decorators/content-section';
import { DisplayName } from '@progress/sitefinity-widget-designers-sdk/decorators/display-name';
import { Content } from '@progress/sitefinity-widget-designers-sdk/decorators/content';
import { WidgetLabel } from '@progress/sitefinity-widget-designers-sdk/decorators/widget-label';
import { ViewSelector } from '@progress/sitefinity-widget-designers-sdk/decorators/view-selector';

/**
 * Lets an editor pick ONE "Board report" item.
 * Type: Telerik.Sitefinity.DynamicTypes.Model.BoardReports.BoardReport
 */
@WidgetEntity('BoardReport', 'Board report')
export class BoardReportEntity {
  @ContentSection('Content', 0)
  @DisplayName('Board report')
  @Content({
    Type: 'Telerik.Sitefinity.DynamicTypes.Model.BoardReports.BoardReport',
    AllowMultipleItemsSelection: false,
    RetrieveData: true,
  })
  BoardReport?: any;

  @WidgetLabel()
  SfWidgetLabel = 'Board report';

  @ContentSection('Design', 1)
  @DisplayName('View')
  @ViewSelector([
    { Name: 'Default', Title: 'Default', Value: 'Default' }
  ])
  ViewName?: string;
}
